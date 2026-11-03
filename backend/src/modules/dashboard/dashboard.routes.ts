import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth';
import * as c from './dashboard.controller';
import { crearCacheDashboard } from './dashboard.service';

/** Se crea por instancia de la app para que cada prueba tenga su propia cache. */
export function crearDashboardRouter() {
  const router = Router();
  router.get('/', autenticar, autorizar('dashboard:leer'), c.obtener(crearCacheDashboard()));
  return router;
}
