import { Router } from 'express';
import { autenticar, autorizarAlguno } from '../../middlewares/auth';
import { validar } from '../../middlewares/validar';
import * as c from './asistencia.controller';
import {
  esquemaHistorial,
  esquemaIdEvento,
  esquemaListaEvento,
  esquemaRegistrarAsistencia,
  esquemaResumen,
} from './asistencia.schemas';

// Variantes "-propio" del COORDINADOR: el service limita a los ministerios que coordina
const puedeLeer = autorizarAlguno('asistencia:leer', 'asistencia:leer-propio');

/** Pase de lista de un evento: se monta en /eventos (GET|PUT /eventos/:id/asistencia). */
export const asistenciaEventoRouter = Router();

asistenciaEventoRouter.get(
  '/:id/asistencia',
  autenticar,
  puedeLeer,
  validar({ params: esquemaIdEvento, query: esquemaListaEvento }),
  c.listaDeEvento,
);
asistenciaEventoRouter.put(
  '/:id/asistencia',
  autenticar,
  autorizarAlguno('asistencia:crear', 'asistencia:crear-propio'),
  validar({ params: esquemaIdEvento, body: esquemaRegistrarAsistencia }),
  c.registrar,
);

/** Historial y resumen: /asistencias. */
export const asistenciasRouter = Router();

asistenciasRouter.get(
  '/',
  autenticar,
  puedeLeer,
  validar({ query: esquemaHistorial }),
  c.historial,
);
asistenciasRouter.get(
  '/resumen',
  autenticar,
  puedeLeer,
  validar({ query: esquemaResumen }),
  c.resumen,
);
