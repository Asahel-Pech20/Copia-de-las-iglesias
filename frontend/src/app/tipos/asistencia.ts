import type { QueryLista } from './comunes';
import type { CategoriaEvento, EstadoEvento } from './eventos';
import type { MinisterioResumen } from './miembros';

// Espejo de backend/src/modules/asistencia (specs.md §7.2, B3)

export interface MiembroBreve {
  id: string;
  nombre: string;
  apellidos: string;
}

/** Fila del pase de lista: null = sin registrar */
export interface RegistroLista {
  miembro: MiembroBreve;
  presente: boolean | null;
}

/** GET /eventos/:id/asistencia */
export interface ListaAsistencia {
  evento: {
    id: string;
    titulo: string;
    fechaInicio: string;
    fechaFin: string | null;
    estado: EstadoEvento;
    ministerio: MinisterioResumen | null;
  };
  registros: RegistroLista[];
  totales: { presentes: number; ausentes: number; sinRegistrar: number; total: number };
}

/** PUT /eventos/:id/asistencia */
export interface RegistrarAsistencia {
  registros: { miembroId: string; presente: boolean }[];
}

/** Fila de GET /asistencias */
export interface AsistenciaHistorial {
  id: string;
  presente: boolean;
  registradoEn: string;
  miembro: MiembroBreve;
  evento: {
    id: string;
    titulo: string;
    categoria: CategoriaEvento;
    fechaInicio: string;
    estado: EstadoEvento;
    ministerio: MinisterioResumen | null;
  };
  registradoPor: { id: string; nombre: string };
}

export interface QueryAsistencias extends QueryLista {
  miembroId?: string;
  eventoId?: string;
  /** "yyyy-MM-dd" */
  desde?: string;
  hasta?: string;
}

export type PeriodoResumen = 'semanal' | 'mensual';

/** Elemento de GET /asistencias/resumen */
export interface ResumenAsistencia {
  /** "2026-W43" o "2026-10" */
  periodo: string;
  eventos: number;
  presentes: number;
  ausentes: number;
  promedioPorEvento: number;
}

export interface QueryResumenAsistencia {
  periodo: PeriodoResumen;
  desde?: string;
  hasta?: string;
  ministerioId?: string;
}
