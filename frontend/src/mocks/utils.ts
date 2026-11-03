import { HttpResponse } from 'msw';
import { API_URL } from '@/app/core/config';
import { type Permiso, tienePermiso } from '@/app/core/permisos';
import type { CodigoError, DetalleError } from '@/app/tipos/comunes';
import type { Usuario } from '@/app/tipos/usuarios';
import { db } from './db';

/** URL absoluta de un endpoint del contrato: ruta('/miembros') */
export function ruta(path: string) {
  return `${API_URL}${path}`;
}

export function errorApi(
  status: number,
  code: CodigoError,
  message: string,
  details?: DetalleError[],
) {
  return HttpResponse.json({ error: { code, message, details } }, { status });
}

export const PREFIJO_TOKEN = 'mock-access-';

/** Usuario dueño del Bearer, o una respuesta 401/403 lista para devolver. */
export function autenticar(request: Request, permiso?: Permiso): Usuario | Response {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (token === 'mock-expirado') {
    return errorApi(401, 'TOKEN_EXPIRED', 'La sesión expiró.');
  }
  const usuario = db.usuarios.find((u) => token === `${PREFIJO_TOKEN}${u.id}` && u.activo);
  if (!usuario) return errorApi(401, 'UNAUTHENTICATED', 'Debes iniciar sesión.');
  if (permiso && !tienePermiso(usuario.rol, permiso)) {
    return errorApi(403, 'FORBIDDEN', 'No tienes permiso para realizar esta acción.');
  }
  return usuario;
}

/** Aplica ?page&limit a una lista y arma { data, meta } */
export function paginarMock<T>(lista: T[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 20)));
  const data = lista.slice((page - 1) * limit, page * limit);
  return HttpResponse.json({
    data,
    meta: { page, limit, total: lista.length, totalPages: Math.ceil(lista.length / limit) },
  });
}

export function ahora() {
  return new Date().toISOString();
}
