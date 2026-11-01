import type { MetaPaginacion } from './paginacion';

// Formato de respuesta del contrato (specs.md §7.1)
export function ok<T>(data: T) {
  return { data };
}

export function okLista<T>(data: T[], meta: MetaPaginacion) {
  return { data, meta };
}
