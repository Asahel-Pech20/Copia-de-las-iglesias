import type { QueryLista } from './comunes';

export interface CoordinadorResumen {
  id: string;
  nombre: string;
}

export interface Ministerio {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  /** Vínculos activos */
  totalIntegrantes: number;
  coordinadores: CoordinadorResumen[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryMinisterios extends QueryLista {
  activo?: boolean;
}

export interface CrearMinisterio {
  nombre: string;
  descripcion?: string | null;
}

export type EditarMinisterio = Partial<CrearMinisterio>;

/** GET /ministerios/:id/miembros */
export interface Integrante {
  /** Id del miembro */
  id: string;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  email: string | null;
  miembroActivo: boolean;
  /** Vínculo activo (false = histórico) */
  activo: boolean;
  fechaUnion: string;
  fechaSalida: string | null;
}

export interface QueryIntegrantes extends QueryLista {
  incluirHistoricos?: boolean;
}
