import { addMonths, addWeeks, format, getISOWeek, getISOWeekYear } from 'date-fns';
import { http, HttpResponse } from 'msw';
import { tienePermiso } from '@/lib/permisos';
import type { Anuncio } from '@/types/anuncios';
import type { Dashboard } from '@/types/dashboard';
import { db } from '../db';
import { autenticar, ruta } from '../utils';
import { resumenEntre, totalDelMes, variacion } from './donaciones';
import { formatearEvento, marcarRealizados } from './eventos';

// Simulación de backend/src/modules/dashboard (B4-07). `ingresos` se OMITE si el rol no tiene
// `donaciones:leer` (no es null). Las series semanales son simuladas y deterministas.

const MESES = 12;
const SEMANAS = 12;

function anunciosImportantes(): Anuncio[] {
  const ya = Date.now();
  return db.anuncios
    .filter(
      (a) =>
        a.prioridad === 'IMPORTANTE' &&
        Date.parse(a.fechaPublicacion) <= ya &&
        (a.fechaExpiracion === null || Date.parse(a.fechaExpiracion) > ya),
    )
    .sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion))
    .slice(0, 3)
    .map(({ eventoId, autorId, ...a }) => {
      const e = eventoId ? db.eventos.find((x) => x.id === eventoId) : undefined;
      return {
        ...a,
        autor: { id: autorId, nombre: db.usuarios.find((u) => u.id === autorId)?.nombre ?? '—' },
        evento: e
          ? { id: e.id, titulo: e.titulo, fechaInicio: e.fechaInicio, estado: e.estado }
          : null,
      };
    });
}

export function construirDashboard(verIngresos: boolean): Dashboard {
  marcarRealizados();
  const hoy = new Date();
  const mesActual = format(hoy, 'yyyy-MM');

  const asistenciaSemanal = Array.from({ length: SEMANAS }, (_, i) => {
    const lunes = addWeeks(hoy, i - (SEMANAS - 1));
    return {
      semana: `${getISOWeekYear(lunes)}-W${String(getISOWeek(lunes)).padStart(2, '0')}`,
      presentes: 62 + ((i * 37) % 31),
      ausentes: 9 + ((i * 7) % 13),
      eventos: 3 + (i % 3),
    };
  });

  const altasMiembrosPorMes = Array.from({ length: MESES }, (_, i) => {
    const mes = format(addMonths(hoy, i - (MESES - 1)), 'yyyy-MM');
    // Los miembros simulados ingresaron hace años: a las altas reales se suma una base simulada
    // determinista para que la gráfica no salga vacía en la demo.
    const reales = db.miembros.filter((m) => m.fechaIngreso.startsWith(mes)).length;
    return { mes, total: reales + 1 + ((i * 5) % 4) };
  });

  const data: Dashboard = {
    miembrosActivos: db.miembros.filter((m) => m.activo).length,
    totalMinisterios: db.ministerios.filter((m) => m.activo).length,
    asistenciasRegistradas: {
      mesActual: db.asistencias.filter((a) => a.registradoEn.startsWith(mesActual)).length + 340,
      semanaActual: asistenciaSemanal.at(-1)?.presentes ?? 0,
    },
    eventosProximos: db.eventos
      .filter((e) => e.estado === 'PROGRAMADO' && Date.parse(e.fechaInicio) >= Date.now())
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
      .slice(0, 5)
      .map(formatearEvento),
    anunciosImportantes: anunciosImportantes(),
    graficas: {
      asistenciaSemanal,
      miembrosPorMinisterio: db.ministerios
        .filter((m) => m.activo)
        .map((m) => ({
          ministerioId: m.id,
          ministerio: m.nombre,
          total: db.vinculos.filter((v) => v.ministerioId === m.id && v.activo).length,
        }))
        .sort((a, b) => b.total - a.total),
      altasMiembrosPorMes,
    },
  };

  if (verIngresos) {
    const desde = `${format(addMonths(hoy, -(MESES - 1)), 'yyyy-MM')}-01`;
    const actual = totalDelMes(hoy.getFullYear(), hoy.getMonth() + 1);
    const anterior = addMonths(hoy, -1);
    const totalAnterior = totalDelMes(anterior.getFullYear(), anterior.getMonth() + 1);
    data.ingresos = {
      mesActual: actual,
      mesAnterior: totalAnterior,
      variacionPorcentual: variacion(actual, totalAnterior),
      porMes: resumenEntre(desde, format(hoy, 'yyyy-MM-dd'), 'mes').grupos.map((g) => ({
        mes: g.clave,
        total: g.total,
        cantidad: g.cantidad,
      })),
    };
  }
  return data;
}

export const dashboardHandlers = [
  http.get(ruta('/dashboard'), ({ request }) => {
    const usuario = autenticar(request, 'dashboard:leer');
    if (usuario instanceof Response) return usuario;
    return HttpResponse.json({
      data: construirDashboard(tienePermiso(usuario.rol, 'donaciones:leer')),
    });
  }),
];
