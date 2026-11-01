import { type Router as TipoRouter, Router } from 'express';
import { crearAuthRouter } from './modules/auth/auth.routes';
import { configuracionRouter } from './modules/configuracion/configuracion.routes';
import { miembrosRouter } from './modules/miembros/miembros.routes';
import { ministeriosRouter } from './modules/ministerios/ministerios.routes';
import { usuariosRouter } from './modules/usuarios/usuarios.routes';

export interface ModuloApi {
  prefijo: string;
  router: TipoRouter;
}

/**
 * Registro de módulos de la API. B2–B4: agreguen aquí su módulo ({ prefijo: '/miembros', router: miembrosRouter }).
 * La prueba de rutas protegidas (B1-18) recorre esta lista.
 */
export function crearModulos(): ModuloApi[] {
  return [
    { prefijo: '/auth', router: crearAuthRouter() },
    { prefijo: '/usuarios', router: usuariosRouter },
    { prefijo: '/configuracion', router: configuracionRouter },
    { prefijo: '/miembros', router: miembrosRouter },
    { prefijo: '/ministerios', router: ministeriosRouter },
  ];
}

export function crearApiRouter() {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({ data: { status: 'ok' } });
  });
  for (const { prefijo, router: modulo } of crearModulos()) router.use(prefijo, modulo);
  return router;
}
