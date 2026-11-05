import { addDays, addMonths, format, getISOWeek, getISOWeekYear, parseISO } from 'date-fns';
import { http, HttpResponse } from 'msw';
import type { DetalleError } from '@/app/tipos/comunes';
import type {
  AgrupacionIngresos,
  ConceptoDonacion,
  Donacion,
  GrupoIngresos,
  GuardarDonacion,
  MetodoPago,
  ResumenIngresos,
  ResumenMensual,
} from '@/app/tipos/donaciones';
import type { DonacionMock } from '../datos/b4';
import { db } from '../db';
import { ahora, autenticar, errorApi, ruta } from '../utils';

// Simulación de backend/src/modules/donaciones (B4). El dinero se suma en centavos enteros.

const CONCEPTOS: ConceptoDonacion[] = [
  'DIEZMO',
  'OFRENDA',
  'PRIMICIA',
  'DONACION_ESPECIAL',
  'OTRO',
];
const METODOS: MetodoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO'];

const aCentavos = (monto: string) => Math.round(Number(monto) * 100);
export const deCentavos = (c: number) => (c / 100).toFixed(2);
const hoy = () => format(new Date(), 'yyyy-MM-dd');

const noExiste = () => errorApi(404, 'NOT_FOUND', 'La aportación no existe.');

export function formatearDonacion(d: DonacionMock): Donacion {
  const m = d.miembroId ? db.miembros.find((x) => x.id === d.miembroId) : undefined;
  const usuarioDe = (id: string) => ({
    id,
    nombre: db.usuarios.find((u) => u.id === id)?.nombre ?? '—',
  });
  const { miembroId: _miembroId, registradoPorId, actualizadoPorId, ...resto } = d;
  return {
    ...resto,
    miembro: m ? { id: m.id, nombre: m.nombre, apellidos: m.apellidos } : null,
    registradoPor: usuarioDe(registradoPorId),
    actualizadoPor: actualizadoPorId ? usuarioDe(actualizadoPorId) : null,
  };
}

function validar(datos: Partial<GuardarDonacion>, actual?: DonacionMock): Response | null {
  const errores: DetalleError[] = [];
  if (datos.monto !== undefined) {
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(datos.monto)) {
      errores.push({ campo: 'monto', mensaje: 'Monto no válido: usa hasta 2 decimales.' });
    } else if (Number(datos.monto) <= 0) {
      errores.push({ campo: 'monto', mensaje: 'El monto debe ser mayor que cero.' });
    }
  }
  if (datos.fecha !== undefined && datos.fecha > hoy()) {
    errores.push({ campo: 'fecha', mensaje: 'La fecha no puede ser futura.' });
  }
  if (datos.anonima === true && datos.miembroId) {
    errores.push({ campo: 'miembroId', mensaje: 'Una aportación anónima no puede tener donante.' });
  }
  const concepto = datos.concepto ?? actual?.concepto;
  const detalle =
    datos.conceptoDetalle !== undefined ? datos.conceptoDetalle : actual?.conceptoDetalle;
  if (concepto === 'OTRO' && !detalle?.trim()) {
    errores.push({ campo: 'conceptoDetalle', mensaje: 'Describe el concepto cuando es "Otro".' });
  }
  if (errores.length > 0) {
    return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', errores);
  }
  if (datos.miembroId && datos.miembroId !== actual?.miembroId) {
    const m = db.miembros.find((x) => x.id === datos.miembroId);
    if (!m?.activo) return errorApi(422, 'BUSINESS_RULE', 'El donante no existe o está inactivo.');
  }
  return null;
}

// ───────── Series de resumen ─────────

const semanaDe = (d: Date) => `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, '0')}`;
const mesDe = (d: Date) => format(d, 'yyyy-MM');

function claveDe(d: DonacionMock, agrupar: AgrupacionIngresos) {
  const fecha = parseISO(`${d.fecha}T00:00:00`);
  switch (agrupar) {
    case 'dia':
      return d.fecha;
    case 'semana':
      return semanaDe(fecha);
    case 'mes':
      return mesDe(fecha);
    case 'concepto':
      return d.concepto;
    case 'metodo':
      return d.metodo;
  }
}

/** Todas las claves del rango (serie continua, con ceros), como el backend. */
function clavesDe(agrupar: AgrupacionIngresos, desde: string, hasta: string): string[] {
  if (agrupar === 'concepto') return CONCEPTOS;
  if (agrupar === 'metodo') return METODOS;
  const claves = new Set<string>();
  const fin = parseISO(`${hasta}T00:00:00`);
  for (let d = parseISO(`${desde}T00:00:00`); d <= fin; d = addDays(d, 1)) {
    claves.add(
      agrupar === 'dia' ? format(d, 'yyyy-MM-dd') : agrupar === 'semana' ? semanaDe(d) : mesDe(d),
    );
  }
  return [...claves];
}

export function resumenEntre(desde: string, hasta: string, agrupar: AgrupacionIngresos) {
  const activas = db.donaciones.filter((d) => !d.anulada && d.fecha >= desde && d.fecha <= hasta);
  const grupos: GrupoIngresos[] = clavesDe(agrupar, desde, hasta).map((clave) => {
    const filas = activas.filter((d) => claveDe(d, agrupar) === clave);
    return {
      clave,
      total: deCentavos(filas.reduce((s, d) => s + aCentavos(d.monto), 0)),
      cantidad: filas.length,
    };
  });
  const total = activas.reduce((s, d) => s + aCentavos(d.monto), 0);
  return { desde, hasta, agrupar, total: deCentavos(total), cantidad: activas.length, grupos };
}

export function totalDelMes(anio: number, mes: number) {
  const prefijo = `${anio}-${String(mes).padStart(2, '0')}`;
  return deCentavos(
    db.donaciones
      .filter((d) => !d.anulada && d.fecha.startsWith(prefijo))
      .reduce((s, d) => s + aCentavos(d.monto), 0),
  );
}

/** Variación porcentual con 1 decimal; null si el periodo anterior no tuvo ingresos. */
export function variacion(actual: string, anterior: string) {
  const base = aCentavos(anterior);
  if (base === 0) return null;
  return Math.round(((aCentavos(actual) - base) / base) * 1000) / 10;
}

const finDeMes = (anio: number, mes: number) => format(new Date(anio, mes, 0), 'yyyy-MM-dd');

export const donacionesHandlers = [
  http.get(ruta('/donaciones/resumen'), ({ request }) => {
    const usuario = autenticar(request, 'donaciones:leer');
    if (usuario instanceof Response) return usuario;
    const p = new URL(request.url).searchParams;
    const hasta = p.get('hasta') ?? hoy();
    const desde = p.get('desde') ?? `${hasta.slice(0, 7)}-01`;
    const agrupar = (p.get('agrupar') ?? 'mes') as AgrupacionIngresos;
    if (hasta < desde) {
      return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [
        { campo: 'hasta', mensaje: '"hasta" debe ser igual o posterior a "desde".' },
      ]);
    }
    const data: ResumenIngresos = resumenEntre(desde, hasta, agrupar);
    return HttpResponse.json({ data });
  }),

  http.get(ruta('/donaciones/resumen-mensual'), ({ request }) => {
    const usuario = autenticar(request, 'donaciones:leer');
    if (usuario instanceof Response) return usuario;
    const p = new URL(request.url).searchParams;
    const base = new Date();
    const anio = Number(p.get('anio') ?? base.getFullYear());
    const mes = Number(p.get('mes') ?? base.getMonth() + 1);
    const desde = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const hasta = finDeMes(anio, mes);
    const anterior = addMonths(new Date(anio, mes - 1, 1), -1);
    const totalAnterior = totalDelMes(anterior.getFullYear(), anterior.getMonth() + 1);
    const porConcepto = resumenEntre(desde, hasta, 'concepto');
    const activas = db.donaciones.filter((d) => !d.anulada && d.fecha >= desde && d.fecha <= hasta);
    const grupo = (anonima: boolean) => {
      const filas = activas.filter((d) => d.anonima === anonima);
      return {
        cantidad: filas.length,
        total: deCentavos(filas.reduce((s, d) => s + aCentavos(d.monto), 0)),
      };
    };
    const data: ResumenMensual = {
      anio,
      mes,
      desde,
      hasta,
      total: porConcepto.total,
      cantidad: porConcepto.cantidad,
      mesAnterior: {
        anio: anterior.getFullYear(),
        mes: anterior.getMonth() + 1,
        total: totalAnterior,
      },
      variacionPorcentual: variacion(porConcepto.total, totalAnterior),
      porConcepto: porConcepto.grupos,
      porMetodo: resumenEntre(desde, hasta, 'metodo').grupos,
      anonimas: grupo(true),
      identificadas: grupo(false),
    };
    return HttpResponse.json({ data });
  }),

  http.get(ruta('/donaciones'), ({ request }) => {
    const usuario = autenticar(request, 'donaciones:leer');
    if (usuario instanceof Response) return usuario;
    const p = new URL(request.url).searchParams;
    const lista = db.donaciones
      .filter((d) => p.get('incluirAnuladas') === 'true' || !d.anulada)
      .filter((d) => !p.get('desde') || d.fecha >= p.get('desde')!)
      .filter((d) => !p.get('hasta') || d.fecha <= p.get('hasta')!)
      .filter((d) => !p.get('concepto') || d.concepto === p.get('concepto'))
      .filter((d) => !p.get('metodo') || d.metodo === p.get('metodo'))
      .filter((d) => !p.get('miembroId') || d.miembroId === p.get('miembroId'))
      .filter((d) => p.get('anonima') === null || String(d.anonima) === p.get('anonima'))
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.createdAt.localeCompare(a.createdAt));
    const page = Math.max(1, Number(p.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(p.get('limit') ?? 20)));
    const totalMonto = deCentavos(
      lista.filter((d) => !d.anulada).reduce((s, d) => s + aCentavos(d.monto), 0),
    );
    return HttpResponse.json({
      data: lista.slice((page - 1) * limit, page * limit).map(formatearDonacion),
      meta: {
        page,
        limit,
        total: lista.length,
        totalPages: Math.ceil(lista.length / limit),
        totalMonto,
      },
    });
  }),

  http.post(ruta('/donaciones'), async ({ request }) => {
    const usuario = autenticar(request, 'donaciones:crear');
    if (usuario instanceof Response) return usuario;
    const datos = (await request.json()) as GuardarDonacion;
    const error = validar(datos);
    if (error) return error;
    const miembroId = datos.miembroId ?? null;
    const nueva: DonacionMock = {
      id: `d-${crypto.randomUUID()}`,
      fecha: datos.fecha,
      monto: Number(datos.monto).toFixed(2),
      concepto: datos.concepto,
      conceptoDetalle: datos.conceptoDetalle?.trim() || null,
      metodo: datos.metodo,
      miembroId,
      // Sin donante ⇒ anónima (specs.md §6)
      anonima: miembroId === null,
      referencia: datos.referencia?.trim() || null,
      notas: datos.notas?.trim() || null,
      anulada: false,
      motivoAnulacion: null,
      anuladaEn: null,
      registradoPorId: usuario.id,
      actualizadoPorId: null,
      createdAt: ahora(),
      updatedAt: ahora(),
    };
    db.donaciones.push(nueva);
    return HttpResponse.json({ data: formatearDonacion(nueva) }, { status: 201 });
  }),

  http.get(ruta('/donaciones/:id'), ({ request, params }) => {
    const usuario = autenticar(request, 'donaciones:leer');
    if (usuario instanceof Response) return usuario;
    const d = db.donaciones.find((x) => x.id === params.id);
    return d ? HttpResponse.json({ data: formatearDonacion(d) }) : noExiste();
  }),

  http.patch(ruta('/donaciones/:id/anular'), async ({ request, params }) => {
    const usuario = autenticar(request, 'donaciones:eliminar');
    if (usuario instanceof Response) return usuario;
    const d = db.donaciones.find((x) => x.id === params.id);
    if (!d) return noExiste();
    const { motivo } = (await request.json()) as { motivo?: string };
    if (!motivo || motivo.trim().length < 5) {
      return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [
        { campo: 'motivo', mensaje: 'El motivo debe tener al menos 5 caracteres.' },
      ]);
    }
    if (d.anulada) return errorApi(422, 'BUSINESS_RULE', 'La aportación ya está anulada.');
    Object.assign(d, {
      anulada: true,
      motivoAnulacion: motivo.trim(),
      anuladaEn: ahora(),
      actualizadoPorId: usuario.id,
      updatedAt: ahora(),
    });
    return HttpResponse.json({ data: formatearDonacion(d) });
  }),

  http.patch(ruta('/donaciones/:id'), async ({ request, params }) => {
    const usuario = autenticar(request, 'donaciones:editar');
    if (usuario instanceof Response) return usuario;
    const d = db.donaciones.find((x) => x.id === params.id);
    if (!d) return noExiste();
    if (d.anulada) {
      return errorApi(422, 'BUSINESS_RULE', 'No se puede editar una aportación anulada.');
    }
    const datos = (await request.json()) as Partial<GuardarDonacion>;
    const error = validar(datos, d);
    if (error) return error;
    const miembroId =
      datos.anonima === true ? null : datos.miembroId !== undefined ? datos.miembroId : d.miembroId;
    if (datos.anonima === false && !miembroId) {
      return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [
        { campo: 'miembroId', mensaje: 'Elige el donante o marca la aportación como anónima.' },
      ]);
    }
    const { anonima: _anonima, miembroId: _miembroId, monto, ...resto } = datos;
    Object.assign(d, resto, {
      ...(monto && { monto: Number(monto).toFixed(2) }),
      miembroId,
      anonima: miembroId === null,
      actualizadoPorId: usuario.id,
      updatedAt: ahora(),
    });
    return HttpResponse.json({ data: formatearDonacion(d) });
  }),
];
