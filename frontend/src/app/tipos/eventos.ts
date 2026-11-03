import type { QueryLista } from './comunes';
import type { MinisterioResumen } from './miembros';

// Espejo de backend/src/modules/eventos (specs.md §6–§7, B3)

export type TipoEvento = 'RELIGIOSO' | 'ADMINISTRATIVO';
export type CategoriaEvento = 'CULTO' | 'REUNION' | 'ACTIVIDAD' | 'OTRO';
export type EstadoEvento = 'PROGRAMADO' | 'CANCELADO' | 'REALIZADO';

/** Fila de GET /eventos y GET /eventos/proximos */
export interface Evento {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoEvento;
  categoria: CategoriaEvento;
  /** ISO 8601 (UTC) */
  fechaInicio: string;
  fechaFin: string | null;
  lugar: string;
  estado: EstadoEvento;
  motivoCancelacion: string | null;
  ministerio: MinisterioResumen | null;
  totalResponsables: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResponsableEvento {
  id: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
}

/** GET /eventos/:id */
export interface EventoDetalle extends Evento {
  creadoPor: { id: string; nombre: string };
  responsables: ResponsableEvento[];
  resumenAsistencia: { presentes: number; ausentes: number; total: number } | null;
}

/** ?desde&hasta → calendario sin paginar (rango ≤ 93 días); sin rango → paginado */
export interface QueryEventos extends QueryLista {
  desde?: string;
  hasta?: string;
  tipo?: TipoEvento;
  categoria?: CategoriaEvento;
  estado?: EstadoEvento;
  ministerioId?: string;
}

export interface GuardarEvento {
  titulo: string;
  descripcion?: string | null;
  tipo: TipoEvento;
  categoria: CategoriaEvento;
  fechaInicio: string;
  fechaFin?: string | null;
  lugar: string;
  ministerioId?: string | null;
}
