import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import * as c from './usuarios.controller';
import {
  esquemaCrearUsuario,
  esquemaEditarUsuario,
  esquemaEstadoUsuario,
  esquemaIdUsuario,
  esquemaListarUsuarios,
  esquemaOpcionesUsuario,
} from './usuarios.schemas';

const porId = validar({ params: esquemaIdUsuario });

export const usuariosRouter = Router();

// /opciones antes de /:id para que no se interprete como id
usuariosRouter.get(
  '/opciones',
  autenticar,
  autorizar('usuarios:opciones'),
  validar({ query: esquemaOpcionesUsuario }),
  c.opciones,
);
usuariosRouter.get(
  '/',
  autenticar,
  autorizar('usuarios:leer'),
  validar({ query: esquemaListarUsuarios }),
  c.listar,
);
usuariosRouter.post(
  '/',
  autenticar,
  autorizar('usuarios:crear'),
  validar({ body: esquemaCrearUsuario }),
  c.crear,
);
usuariosRouter.get('/:id', autenticar, autorizar('usuarios:leer'), porId, c.obtener);
usuariosRouter.patch(
  '/:id',
  autenticar,
  autorizar('usuarios:editar'),
  porId,
  validar({ body: esquemaEditarUsuario }),
  c.editar,
);
usuariosRouter.patch(
  '/:id/estado',
  autenticar,
  autorizar('usuarios:eliminar'),
  porId,
  validar({ body: esquemaEstadoUsuario }),
  c.cambiarEstado,
);
usuariosRouter.post(
  '/:id/reenviar-invitacion',
  autenticar,
  autorizar('usuarios:editar'),
  porId,
  c.reenviarInvitacion,
);
