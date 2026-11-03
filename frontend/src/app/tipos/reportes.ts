import type { AgrupacionIngresos } from './donaciones';

// Espejo de backend/src/lib/exportadores/reporte.ts y modules/reportes (B4)

export type TipoReporte = 'miembros' | 'asistencia' | 'ministerios' | 'ingresos';
export type FormatoReporte = 'json' | 'pdf' | 'xlsx';
/** Formatos de descarga (la vista previa usa `json`) */
export type FormatoDescarga = Exclude<FormatoReporte, 'json'>;

export type TipoColumna = 'texto' | 'fecha' | 'fechaHora' | 'moneda' | 'numero' | 'porcentaje';
export type Celda = string | number | null;

export interface ColumnaReporte {
  clave: string;
  titulo: string;
  tipo?: TipoColumna;
  ancho?: number;
}

export interface SeccionReporte {
  titulo: string;
  columnas: ColumnaReporte[];
  filas: Record<string, Celda>[];
  totales?: Record<string, Celda>;
}

export interface DatoReporte {
  etiqueta: string;
  valor: Celda;
  tipo?: TipoColumna;
}

/** GET /reportes/{tipo}?formato=json */
export interface Reporte {
  tipo: TipoReporte;
  titulo: string;
  subtitulo?: string;
  filtros: DatoReporte[];
  resumen: DatoReporte[];
  secciones: SeccionReporte[];
  generadoEn: string;
  generadoPor: string;
}

/** Filtros de cada reporte (los mismos que acepta el backend, sin `formato`). Todos opcionales. */
export interface FiltrosReporte {
  /** miembros */
  estado?: 'activo' | 'inactivo' | 'todos';
  /** asistencia */
  eventoId?: string;
  periodo?: 'semanal' | 'mensual';
  /** asistencia, ministerios, ingresos ("yyyy-MM-dd") */
  desde?: string;
  hasta?: string;
  /** ministerios */
  ministerioId?: string;
  /** ingresos */
  agrupar?: AgrupacionIngresos;
}

export interface ArchivoDescargado {
  blob: Blob;
  nombre: string;
}
