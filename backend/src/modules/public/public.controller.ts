import type { RequestHandler } from 'express';
import { ok } from '../../lib/respuesta';
import type { crearCacheCartelera } from './public.service';

export function cartelera(obtener: ReturnType<typeof crearCacheCartelera>): RequestHandler {
  return async function cartelera(_req, res) {
    res.json(ok(await obtener()));
  };
}
