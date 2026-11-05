import { http, HttpResponse } from 'msw';
import { type Permiso, tienePermiso } from '@/app/core/permisos';
import type { DetalleError } from '@/app/tipos/comunes';
import type { Evento, EventoDetalle, GuardarEvento } from '@/app/tipos/eventos';
import type { Usuario } from '@/app/tipos/usuarios';
import type { EventoMock } from '../datos/b3';
import { db } from '../db';
import { ahora, autenticar, errorApi, paginarMock, ruta } from '../utils';

// Simulación de backend/src/modules/eventos (B3) con las mismas reglas de negocio

const DIA = 86_400_000;
const noExiste = () => errorApi(404, 'NOT_FOUND', 'El evento no existe.');

/** PROGRAMADO cuya fecha ya pasó → REALIZADO (como el backend al consultar). */
export function marcarRealizados() {
  const ya = Date.now();
  for (const e of db.eventos) {
    if (e.estado === 'PROGRAMADO' && Date.parse(e.fechaFin ?? e.fechaInicio) < ya) {
      e.estado = 'REALIZADO';
    }
  }
}

function ministerioDe(id: string | null) {
  const m = id ? db.ministerios.find((x) => x.id === id) : undefined;
  return m ? { id: m.id, nombre: m.nombre } : null;
}

export function formatearEvento({ ministerioId, creadoPorId: _c, ...e }: EventoMock): Evento {
  return {
    ...e,
    ministerio: ministerioDe(ministerioId),
    totalResponsables: db.responsables.filter((r) => r.eventoId === e.id).length,
  };
}

function detalle(e: EventoMock): EventoDetalle {
  const creador = db.usuarios.find((u) => u.id === e.creadoPorId);
  const registros = db.asistencias.filter((a) => a.eventoId === e.id);
  const presentes = registros.filter((a) => a.presente).length;
  return {
    ...formatearEvento(e),
    creadoPor: { id: e.creadoPorId, nombre: creador?.nombre ?? '—' },
    responsables: db.responsables
      .filter((r) => r.eventoId === e.id)
      .map((r) => db.miembros.find((m) => m.id === r.miembroId)!)
      .map(({ id, nombre, apellidos, activo }) => ({ id, nombre, apellidos, activo }))
      .sort((a, b) => a.apellidos.localeCompare(b.apellidos)),
    resumenAsistencia:
      registros.length > 0
        ? { presentes, ausentes: registros.length - presentes, total: registros.length }
        : null,
  };
}

/** ¿Permiso completo, o "-propio" y coordina el ministerio? */
export function gestiona(
  usuario: Usuario,
  ministerioId: string | null,
  completo: Permiso,
  propio: Permiso,
) {
  if (tienePermiso(usuario.rol, completo)) return true;
  return (
    tienePermiso(usuario.rol, propio) &&
    ministerioId !== null &&
    db.coordinaciones.some((c) => c.ministerioId === ministerioId && c.usuarioId === usuario.id)
  );
}

const prohibido = (mensaje = 'Solo puedes gestionar eventos de los ministerios que coordinas.') =>
  errorApi(403, 'FORBIDDEN', mensaje);

function validarCampos(datos: Partial<GuardarEvento>, actual?: EventoMock): DetalleError[] {
  const errores: DetalleError[] = [];
  if (datos.titulo !== undefined && !datos.titulo.trim()) {
    errores.push({ campo: 'titulo', mensaje: 'Escribe el título.' });
  }
  if (datos.lugar !== undefined && !datos.lugar.trim()) {
    errores.push({ campo: 'lugar', mensaje: 'Escribe el lugar.' });
  }
  const inicio = datos.fechaInicio ?? actual?.fechaInicio;
  const fin = datos.fechaFin === undefined ? actual?.fechaFin : datos.fechaFin;
  if (inicio && fin && Date.parse(fin) < Date.parse(inicio)) {
    errores.push({
      campo: 'fechaFin',
      mensaje: 'La fecha de fin debe ser igual o posterior a la de inicio.',
    });
  }
  return errores;
}

function validarMinisterio(id: string | null | undefined) {
  if (!id) return null;
  const m = db.ministerios.find((x) => x.id === id);
  if (!m) return errorApi(422, 'BUSINESS_RULE', 'El ministerio no existe.');
  if (!m.activo) {
    return errorApi(
      422,
      'BUSINESS_RULE',
      'No se pueden programar eventos de un ministerio inactivo.',
    );
  }
  return null;
}

export const eventosHandlers = [
  http.get(ruta('/eventos'), ({ request }) => {
    const usuario = autenticar(request, 'eventos:leer');
    if (usuario instanceof Response) return usuario;
    marcarRealizados();
    const url = new URL(request.url);
    const p = (k: string) => url.searchParams.get(k);
    // Una fecha sola ("yyyy-MM-dd") cuenta como el día completo (aquí, en hora local)
    const soloFecha = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
    const desde = p('desde')
      ? Date.parse(soloFecha(p('desde')!) ? `${p('desde')}T00:00:00` : p('desde')!)
      : null;
    const hasta = p('hasta')
      ? soloFecha(p('hasta')!)
        ? Date.parse(`${p('hasta')}T00:00:00`) + DIA - 1
        : Date.parse(p('hasta')!)
      : null;
    if (desde !== null && hasta !== null && hasta - desde > 93 * DIA) {
      return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [
        { campo: 'hasta', mensaje: 'El rango no puede pasar de 93 días.' },
      ]);
    }
    const lista = db.eventos.filter(
      (e) =>
        (hasta === null || Date.parse(e.fechaInicio) <= hasta) &&
        (desde === null || Date.parse(e.fechaFin ?? e.fechaInicio) >= desde) &&
        (!p('tipo') || e.tipo === p('tipo')) &&
        (!p('categoria') || e.categoria === p('categoria')) &&
        (!p('estado') || e.estado === p('estado')) &&
        (!p('ministerioId') || e.ministerioId === p('ministerioId')),
    );
    if (desde !== null && hasta !== null) {
      const datos = lista
        .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
        .map(formatearEvento);
      return HttpResponse.json({
        data: datos,
        meta: { page: 1, limit: 500, total: datos.length, totalPages: 1 },
      });
    }
    return paginarMock(
      lista.sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)).map(formatearEvento),
      url,
    );
  }),

  http.get(ruta('/eventos/proximos'), ({ request }) => {
    const usuario = autenticar(request, 'eventos:leer');
    if (usuario instanceof Response) return usuario;
    marcarRealizados();
    const limit = Number(new URL(request.url).searchParams.get('limit') ?? 5);
    const data = db.eventos
      .filter((e) => e.estado === 'PROGRAMADO' && Date.parse(e.fechaInicio) >= Date.now())
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
      .slice(0, limit)
      .map(formatearEvento);
    return HttpResponse.json({ data });
  }),

  http.get(ruta('/eventos/:id'), ({ request, params }) => {
    const usuario = autenticar(request, 'eventos:leer');
    if (usuario instanceof Response) return usuario;
    marcarRealizados();
    const e = db.eventos.find((x) => x.id === params.id);
    return e ? HttpResponse.json({ data: detalle(e) }) : noExiste();
  }),

  http.post(ruta('/eventos'), async ({ request }) => {
    const usuario = autenticar(request);
    if (usuario instanceof Response) return usuario;
    const datos = (await request.json()) as GuardarEvento;
    if (!gestiona(usuario, datos.ministerioId ?? null, 'eventos:crear', 'eventos:crear-propio')) {
      return prohibido(
        'Como coordinador solo puedes crear eventos de un ministerio que coordinas.',
      );
    }
    const errores = validarCampos(datos);
    if (errores.length > 0) {
      return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', errores);
    }
    const errorMinisterio = validarMinisterio(datos.ministerioId);
    if (errorMinisterio) return errorMinisterio;
    const nuevo: EventoMock = {
      id: `ev-${crypto.randomUUID()}`,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion?.trim() || null,
      tipo: datos.tipo,
      categoria: datos.categoria,
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin ?? null,
      lugar: datos.lugar.trim(),
      estado: 'PROGRAMADO',
      motivoCancelacion: null,
      ministerioId: datos.ministerioId ?? null,
      creadoPorId: usuario.id,
      createdAt: ahora(),
      updatedAt: ahora(),
    };
    db.eventos.push(nuevo);
    return HttpResponse.json({ data: detalle(nuevo) }, { status: 201 });
  }),

  http.patch(ruta('/eventos/:id'), async ({ request, params }) => {
    const usuario = autenticar(request);
    if (usuario instanceof Response) return usuario;
    const e = db.eventos.find((x) => x.id === params.id);
    if (!e) return noExiste();
    if (!gestiona(usuario, e.ministerioId, 'eventos:editar', 'eventos:editar-propio')) {
      return prohibido();
    }
    if (e.estado === 'CANCELADO') {
      return errorApi(422, 'BUSINESS_RULE', 'Un evento cancelado no se puede editar.');
    }
    const datos = (await request.json()) as Partial<GuardarEvento>;
    if (
      datos.ministerioId !== undefined &&
      datos.ministerioId !== e.ministerioId &&
      !gestiona(usuario, datos.ministerioId, 'eventos:editar', 'eventos:editar-propio')
    ) {
      return prohibido();
    }
    const errores = validarCampos(datos, e);
    if (errores.length > 0) {
      return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', errores);
    }
    if (datos.ministerioId !== undefined && datos.ministerioId !== e.ministerioId) {
      const errorMinisterio = validarMinisterio(datos.ministerioId);
      if (errorMinisterio) return errorMinisterio;
    }
    Object.assign(e, datos, {
      descripcion: datos.descripcion === undefined ? e.descripcion : datos.descripcion || null,
      updatedAt: ahora(),
    });
    return HttpResponse.json({ data: detalle(e) });
  }),

  http.patch(ruta('/eventos/:id/cancelar'), async ({ request, params }) => {
    const usuario = autenticar(request);
    if (usuario instanceof Response) return usuario;
    const e = db.eventos.find((x) => x.id === params.id);
    if (!e) return noExiste();
    if (!gestiona(usuario, e.ministerioId, 'eventos:eliminar', 'eventos:eliminar-propio')) {
      return prohibido();
    }
    const { motivo } = (await request.json()) as { motivo?: string };
    const texto = motivo?.trim() ?? '';
    if (texto.length < 5 || texto.length > 300) {
      return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [
        { campo: 'motivo', mensaje: 'El motivo debe tener entre 5 y 300 caracteres.' },
      ]);
    }
    if (e.estado === 'CANCELADO') {
      return errorApi(422, 'BUSINESS_RULE', 'El evento ya está cancelado.');
    }
    Object.assign(e, { estado: 'CANCELADO', motivoCancelacion: texto, updatedAt: ahora() });
    return HttpResponse.json({ data: detalle(e) });
  }),

  http.put(ruta('/eventos/:id/responsables'), async ({ request, params }) => {
    const usuario = autenticar(request);
    if (usuario instanceof Response) return usuario;
    const e = db.eventos.find((x) => x.id === params.id);
    if (!e) return noExiste();
    if (!gestiona(usuario, e.ministerioId, 'eventos:editar', 'eventos:editar-propio')) {
      return prohibido();
    }
    if (e.estado === 'CANCELADO') {
      return errorApi(422, 'BUSINESS_RULE', 'Un evento cancelado no se puede editar.');
    }
    const ids = [...new Set(((await request.json()) as { miembroIds: string[] }).miembroIds)];
    if (ids.length > 10) {
      return errorApi(400, 'VALIDATION_ERROR', 'Los datos enviados no son válidos.', [
        { campo: 'miembroIds', mensaje: 'Máximo 10 responsables.' },
      ]);
    }
    const invalidos: DetalleError[] = ids.flatMap((id) => {
      const m = db.miembros.find((x) => x.id === id);
      if (!m) return [{ campo: 'miembroIds', mensaje: `El miembro ${id} no existe.` }];
      if (!m.activo) {
        return [{ campo: 'miembroIds', mensaje: `${m.nombre} ${m.apellidos} está inactivo.` }];
      }
      return [];
    });
    if (invalidos.length > 0) {
      return errorApi(
        422,
        'BUSINESS_RULE',
        `No se pueden asignar como responsables: ${invalidos.map((d) => d.mensaje).join(' ')}`,
        invalidos,
      );
    }
    db.responsables = [
      ...db.responsables.filter((r) => r.eventoId !== e.id),
      ...ids.map((miembroId) => ({ eventoId: e.id, miembroId })),
    ];
    return HttpResponse.json({ data: detalle(e) });
  }),
];
