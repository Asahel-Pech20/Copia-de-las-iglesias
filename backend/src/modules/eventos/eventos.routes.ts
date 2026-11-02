import { Router } from 'express';
import { autenticar, autorizar, autorizarAlguno } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import * as c from './eventos.controller';
import {
  esquemaCancelarEvento,
  esquemaCrearEvento,
  esquemaEditarEvento,
  esquemaIdEvento,
  esquemaListarEventos,
  esquemaProximos,
  esquemaResponsables,
} from './eventos.schemas';

const porId = validar({ params: esquemaIdEvento });
// Variantes "-propio" del COORDINADOR: el service verifica que coordine el ministerio del evento
const puedeEditar = autorizarAlguno('eventos:editar', 'eventos:editar-propio');

export const eventosRouter = Router();

eventosRouter.get(
  '/',
  autenticar,
  autorizar('eventos:leer'),
  validar({ query: esquemaListarEventos }),
  c.listar,
);
eventosRouter.get(
  '/proximos',
  autenticar,
  autorizar('eventos:leer'),
  validar({ query: esquemaProximos }),
  c.proximos,
);
eventosRouter.post(
  '/',
  autenticar,
  autorizarAlguno('eventos:crear', 'eventos:crear-propio'),
  validar({ body: esquemaCrearEvento }),
  c.crear,
);
eventosRouter.get('/:id', autenticar, autorizar('eventos:leer'), porId, c.obtener);
eventosRouter.patch(
  '/:id',
  autenticar,
  puedeEditar,
  porId,
  validar({ body: esquemaEditarEvento }),
  c.editar,
);
eventosRouter.patch(
  '/:id/cancelar',
  autenticar,
  autorizarAlguno('eventos:eliminar', 'eventos:eliminar-propio'),
  porId,
  validar({ body: esquemaCancelarEvento }),
  c.cancelar,
);
eventosRouter.put(
  '/:id/responsables',
  autenticar,
  puedeEditar,
  porId,
  validar({ body: esquemaResponsables }),
  c.asignarResponsables,
);
