// PLANTILLA — cada ruta declara autenticar + autorizar('<modulo>:<accion>') + validar(...) + controller.
// Regístralo en src/routes.ts (crearModulos) y documenta las rutas en backend/openapi.yaml.
import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import * as c from './_plantilla.controller';
import { esquemaId, esquemaListar } from './_plantilla.schemas';

export const plantillaRouter = Router();

plantillaRouter.get(
  '/',
  autenticar,
  autorizar('configuracion:leer'),
  validar({ query: esquemaListar }),
  c.listar,
);
plantillaRouter.get(
  '/:id',
  autenticar,
  autorizar('configuracion:leer'),
  validar({ params: esquemaId }),
  c.obtener,
);
