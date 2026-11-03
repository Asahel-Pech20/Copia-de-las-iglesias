import type { Anuncio } from './anuncios';
import type { Evento } from './eventos';

// Espejo de backend/src/modules/dashboard (specs.md §7.2, B4)

export interface IngresosDashboard {
  mesActual: string;
  mesAnterior: string;
  /** null si el mes anterior no tuvo ingresos */
  variacionPorcentual: number | null;
  /** Últimos 12 meses, en orden */
  porMes: { mes: string; total: string; cantidad: number }[];
}

/** GET /dashboard. `ingresos` NO viene si el rol no tiene `donaciones:leer`. */
export interface Dashboard {
  miembrosActivos: number;
  totalMinisterios: number;
  asistenciasRegistradas: { mesActual: number; semanaActual: number };
  eventosProximos: Evento[];
  anunciosImportantes: Anuncio[];
  graficas: {
    /** Últimas 12 semanas; `semana` = "2026-W43" */
    asistenciaSemanal: { semana: string; presentes: number; ausentes: number; eventos: number }[];
    miembrosPorMinisterio: { ministerioId: string; ministerio: string; total: number }[];
    /** `mes` = "2026-10" */
    altasMiembrosPorMes: { mes: string; total: number }[];
  };
  ingresos?: IngresosDashboard;
}
