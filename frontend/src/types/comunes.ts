// Tipos del contrato de la API (specs.md §7.1). Espejo exacto del backend.
export type { Permiso, RolUsuario as Rol } from '@/lib/permisos';

export interface MetaPaginacion {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RespuestaLista<T> {
  data: T[];
  meta: MetaPaginacion;
}

export interface RespuestaObjeto<T> {
  data: T;
}

export type CodigoError =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export interface DetalleError {
  campo?: string;
  mensaje: string;
}

/** Error normalizado por lib/api.ts. `NETWORK_ERROR` = sin respuesta del servidor. */
export interface ErrorApi {
  status: number;
  code: CodigoError | 'NETWORK_ERROR';
  message: string;
  details?: DetalleError[];
}

/** Query común de listados: ?page=&limit=&q=&orden=campo:asc */
export interface QueryLista {
  page?: number;
  limit?: number;
  q?: string;
  orden?: `${string}:${'asc' | 'desc'}`;
}
