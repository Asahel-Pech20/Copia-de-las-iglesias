import { Router } from 'express';
import { autenticar, autorizar } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import * as c from './anuncios.controller';
import {
  esquemaCrearAnuncio,
  esquemaEditarAnuncio,
  esquemaIdAnuncio,
  esquemaListarAnuncios,
} from './anuncios.schemas';

const porId = validar({ params: esquemaIdAnuncio });

export const anunciosRouter = Router();

anunciosRouter.get(
  '/',
  autenticar,
  autorizar('anuncios:leer'),
  validar({ query: esquemaListarAnuncios }),
  c.listar,
);
anunciosRouter.post(
  '/',
  autenticar,
  autorizar('anuncios:crear'),
  validar({ body: esquemaCrearAnuncio }),
  c.crear,
);
anunciosRouter.get('/:id', autenticar, autorizar('anuncios:leer'), porId, c.obtener);
anunciosRouter.patch(
  '/:id',
  autenticar,
  autorizar('anuncios:editar'),
  porId,
  validar({ body: esquemaEditarAnuncio }),
  c.editar,
);
anunciosRouter.delete('/:id', autenticar, autorizar('anuncios:eliminar'), porId, c.eliminar);
