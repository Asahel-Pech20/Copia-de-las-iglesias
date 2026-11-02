import { http, HttpResponse } from 'msw';
import { tienePermiso } from '@/lib/permisos';
import type {
  AsistenciaHistorial,
  ListaAsistencia,
  RegistrarAsistencia,
  ResumenAsistencia,
} from '@/types/asistencia';
import type { DetalleError } from '@/types/comunes';
import type { Usuario } from '@/types/usuarios';
import type { EventoMock } from '../datos/b3';
import { db } from '../db';
import { autenticar, errorApi, paginarMock, ruta } from '../utils';
import { gestiona, marcarRealizados } from './eventos';
import { coincide } from './miembros';

// Simulación de backend/src/modules/asistencia (B3)

const DIA = 86_400_000;
const prohibido = () =>
  errorApi(
    403,
    'FORBIDDEN',
    'Solo puedes gestionar la asistencia de eventos de los ministerios que coordinas.',
  );

function lista(e: EventoMock, q: string | null): ListaAsistencia {
  const esperados = db.miembros.filter(
    (m) =>
      m.activo &&
      (!e.ministerioId ||
        db.vinculos.some(
          (v) => v.miembroId === m.id && v.ministerioId === e.ministerioId && v.activo,
        )),
  );
  const registros = db.asistencias.filter((a) => a.eventoId === e.id);
  const ids = new Set([...esperados.map((m) => m.id), ...registros.map((r) => r.miembroId)]);
  const filas = [...ids]
    .map((id) => db.miembros.find((m) => m.id === id)!)
    .sort((a, b) => a.apellidos.localeCompare(b.apellidos) || a.nombre.localeCompare(b.nombre))
    .map(({ id, nombre, apellidos }) => ({
      miembro: { id, nombre, apellidos },
      presente: registros.find((r) => r.miembroId === id)?.presente ?? null,
    }));
  const ministerio = db.ministerios.find((m) => m.id === e.ministerioId);
  return {
    evento: {
      id: e.id,
      titulo: e.titulo,
      fechaInicio: e.fechaInicio,
      fechaFin: e.fechaFin,
      estado: e.estado,
      ministerio: ministerio ? { id: ministerio.id, nombre: ministerio.nombre } : null,
    },
    registros: filas.filter((f) => coincide(f.miembro, q)),
    totales: {
      presentes: filas.filter((f) => f.presente === true).length,
      ausentes: filas.filter((f) => f.presente === false).length,
      sinRegistrar: filas.filter((f) => f.presente === null).length,
      total: filas.length,
    },
  };
}

/** Ministerios a los que se limita el COORDINADOR; null = sin límite. */
function alcance(usuario: Usuario) {
  if (tienePermiso(usuario.rol, 'asistencia:leer')) return null;
  return db.coordinaciones.filter((c) => c.usuarioId === usuario.id).map((c) => c.ministerioId);
}

/** Semana ISO ("2026-W43") de una fecha local */
function semanaIso(fecha: Date) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const anio = d.getUTCFullYear();
  const semana = Math.floor((d.getTime() - Date.UTC(anio, 0, 1)) / DIA / 7) + 1;
  return `${anio}-W${String(semana).padStart(2, '0')}`;
}

const mesDe = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

export const asistenciaHandlers = [
  http.get(ruta('/eventos/:id/asistencia'), ({ request, params }) => {
    const usuario = autenticar(request);
    if (usuario instanceof Response) return usuario;
    marcarRealizados();
    const e = db.eventos.find((x) => x.id === params.id);
    if (!e) return errorApi(404, 'NOT_FOUND', 'El evento no existe.');
    if (!gestiona(usuario, e.ministerioId, 'asistencia:leer', 'asistencia:leer-propio')) {
      return prohibido();
    }
    return HttpResponse.json({ data: lista(e, new URL(request.url).searchParams.get('q')) });
  }),

  http.put(ruta('/eventos/:id/asistencia'), async ({ request, params }) => {
    const usuario = autenticar(request);
    if (usuario instanceof Response) return usuario;
    const e = db.eventos.find((x) => x.id === params.id);
    if (!e) return errorApi(404, 'NOT_FOUND', 'El evento no existe.');
    if (!gestiona(usuario, e.ministerioId, 'asistencia:crear', 'asistencia:crear-propio')) {
      return prohibido();
    }
    if (e.estado === 'CANCELADO') {
      return errorApi(
        422,
        'BUSINESS_RULE',
        'No se puede registrar asistencia en un evento cancelado.',
      );
    }
    if (Date.parse(e.fechaInicio) - Date.now() > DIA) {
      return errorApi(
        422,
        'BUSINESS_RULE',
        'Solo se puede pasar lista desde un día antes del inicio del evento.',
      );
    }
    const { registros } = (await request.json()) as RegistrarAsistencia;
    const invalidos: DetalleError[] = registros.flatMap(({ miembroId }) => {
      const m = db.miembros.find((x) => x.id === miembroId);
      const yaRegistrado = db.asistencias.some(
        (a) => a.eventoId === e.id && a.miembroId === miembroId,
      );
      if (!m) return [{ campo: 'registros', mensaje: `El miembro ${miembroId} no existe.` }];
      if (!m.activo && !yaRegistrado) {
        return [{ campo: 'registros', mensaje: `${m.nombre} ${m.apellidos} está inactivo.` }];
      }
      return [];
    });
    if (invalidos.length > 0) {
      return errorApi(
        422,
        'BUSINESS_RULE',
        `No se puede registrar la asistencia: ${invalidos.map((d) => d.mensaje).join(' ')}`,
        invalidos,
      );
    }
    const registradoEn = new Date().toISOString();
    for (const { miembroId, presente } of registros) {
      const existente = db.asistencias.find(
        (a) => a.eventoId === e.id && a.miembroId === miembroId,
      );
      if (existente)
        Object.assign(existente, { presente, registradoPorId: usuario.id, registradoEn });
      else {
        db.asistencias.push({
          id: `as-${crypto.randomUUID()}`,
          eventoId: e.id,
          miembroId,
          presente,
          registradoPorId: usuario.id,
          registradoEn,
        });
      }
    }
    if (e.estado === 'PROGRAMADO' && Date.parse(e.fechaInicio) <= Date.now())
      e.estado = 'REALIZADO';
    return HttpResponse.json({ data: lista(e, null) });
  }),

  http.get(ruta('/asistencias'), ({ request }) => {
    const usuario = autenticar(request);
    if (usuario instanceof Response) return usuario;
    if (
      !tienePermiso(usuario.rol, 'asistencia:leer') &&
      !tienePermiso(usuario.rol, 'asistencia:leer-propio')
    ) {
      return errorApi(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.');
    }
    const url = new URL(request.url);
    const p = (k: string) => url.searchParams.get(k);
    const ministerios = alcance(usuario);
    const desde = p('desde') ? Date.parse(`${p('desde')}T00:00:00`) : null;
    const hasta = p('hasta') ? Date.parse(`${p('hasta')}T00:00:00`) + DIA : null;
    const filas: AsistenciaHistorial[] = db.asistencias
      .map((a) => ({ a, e: db.eventos.find((x) => x.id === a.eventoId)! }))
      .filter(
        ({ a, e }) =>
          (!p('miembroId') || a.miembroId === p('miembroId')) &&
          (!p('eventoId') || a.eventoId === p('eventoId')) &&
          (!ministerios || (e.ministerioId !== null && ministerios.includes(e.ministerioId))) &&
          (desde === null || Date.parse(e.fechaInicio) >= desde) &&
          (hasta === null || Date.parse(e.fechaInicio) < hasta),
      )
      .sort((x, y) => y.e.fechaInicio.localeCompare(x.e.fechaInicio))
      .map(({ a, e }) => {
        const m = db.miembros.find((x) => x.id === a.miembroId)!;
        const ministerio = db.ministerios.find((x) => x.id === e.ministerioId);
        const registrador = db.usuarios.find((u) => u.id === a.registradoPorId);
        return {
          id: a.id,
          presente: a.presente,
          registradoEn: a.registradoEn,
          miembro: { id: m.id, nombre: m.nombre, apellidos: m.apellidos },
          evento: {
            id: e.id,
            titulo: e.titulo,
            categoria: e.categoria,
            fechaInicio: e.fechaInicio,
            estado: e.estado,
            ministerio: ministerio ? { id: ministerio.id, nombre: ministerio.nombre } : null,
          },
          registradoPor: { id: a.registradoPorId, nombre: registrador?.nombre ?? '—' },
        };
      });
    return paginarMock(filas, url);
  }),

  http.get(ruta('/asistencias/resumen'), ({ request }) => {
    const usuario = autenticar(request);
    if (usuario instanceof Response) return usuario;
    if (
      !tienePermiso(usuario.rol, 'asistencia:leer') &&
      !tienePermiso(usuario.rol, 'asistencia:leer-propio')
    ) {
      return errorApi(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.');
    }
    const url = new URL(request.url);
    const periodo = url.searchParams.get('periodo') === 'mensual' ? 'mensual' : 'semanal';
    const ministerioId = url.searchParams.get('ministerioId');
    const ministerios = alcance(usuario);
    if (ministerioId && ministerios && !ministerios.includes(ministerioId)) {
      return errorApi(
        403,
        'FORBIDDEN',
        'Solo puedes consultar la asistencia de los ministerios que coordinas.',
      );
    }
    const hoy = new Date();
    const hasta = url.searchParams.get('hasta')
      ? new Date(`${url.searchParams.get('hasta')}T00:00:00`)
      : hoy;
    const desde = url.searchParams.get('desde')
      ? new Date(`${url.searchParams.get('desde')}T00:00:00`)
      : new Date(
          periodo === 'semanal'
            ? hasta.getTime() - 77 * DIA
            : new Date(hasta.getFullYear(), hasta.getMonth() - 5, 1).getTime(),
        );
    const etiqueta = periodo === 'semanal' ? semanaIso : mesDe;
    const serie = new Map<string, ResumenAsistencia>();
    for (let d = new Date(desde); d <= hasta; d = new Date(d.getTime() + DIA)) {
      const p = etiqueta(d);
      if (!serie.has(p)) {
        serie.set(p, { periodo: p, eventos: 0, presentes: 0, ausentes: 0, promedioPorEvento: 0 });
      }
    }
    const filtro = ministerioId ? [ministerioId] : ministerios;
    for (const e of db.eventos) {
      if (e.estado === 'CANCELADO' || (filtro && !filtro.includes(e.ministerioId ?? ''))) continue;
      const fecha = new Date(e.fechaInicio);
      const fila = serie.get(etiqueta(fecha));
      const registros = db.asistencias.filter((a) => a.eventoId === e.id);
      if (!fila || registros.length === 0) continue;
      fila.eventos += 1;
      fila.presentes += registros.filter((a) => a.presente).length;
      fila.ausentes += registros.filter((a) => !a.presente).length;
    }
    const data = [...serie.values()].map((f) => ({
      ...f,
      promedioPorEvento: f.eventos > 0 ? Math.round((f.presentes / f.eventos) * 10) / 10 : 0,
    }));
    return HttpResponse.json({ data });
  }),
];
