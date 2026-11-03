import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AppError } from '../../lib/appError';
import * as c from './public.controller';
import { crearCacheCartelera } from './public.service';

/**
 * Rutas públicas (sin sesión). Se crean por instancia de la app para que cada prueba tenga
 * su propio contador de rate limit y su propia cache.
 */
export function crearPublicRouter() {
  const router = Router();
  const obtenerCartelera = crearCacheCartelera();
  const limite = rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(new AppError('RATE_LIMITED', 'Demasiadas solicitudes, espera un minuto.', 429)),
  });

  router.get('/cartelera', limite, c.cartelera(obtenerCartelera));
  return router;
}
