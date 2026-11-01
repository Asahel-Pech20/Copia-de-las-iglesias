import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import * as c from './miembros.controller';
import {
  esquemaCrearMiembro,
  esquemaEditarMiembro,
  esquemaEstadoMiembro,
  esquemaIdMiembro,
  esquemaListarMiembros,
} from './miembros.schemas';

const porId = validar({ params: esquemaIdMiembro });

// Sin DELETE: los miembros solo se desactivan (AGENTS.md regla 3)
export const miembrosRouter = Router();

miembrosRouter.get(
  '/',
  autenticar,
  autorizar('miembros:leer'),
  validar({ query: esquemaListarMiembros }),
  c.listar,
);
miembrosRouter.post(
  '/',
  autenticar,
  autorizar('miembros:crear'),
  validar({ body: esquemaCrearMiembro }),
  c.crear,
);
miembrosRouter.get('/:id', autenticar, autorizar('miembros:leer'), porId, c.obtener);
miembrosRouter.patch(
  '/:id',
  autenticar,
  autorizar('miembros:editar'),
  porId,
  validar({ body: esquemaEditarMiembro }),
  c.editar,
);
miembrosRouter.patch(
  '/:id/estado',
  autenticar,
  autorizar('miembros:eliminar'),
  porId,
  validar({ body: esquemaEstadoMiembro }),
  c.cambiarEstado,
);
