import { http, HttpResponse } from 'msw';
import { ruta } from '../utils';
import { authHandlers } from './auth';
import { configuracionHandlers } from './configuracion';
import { miembrosHandlers } from './miembros';
import { ministeriosHandlers } from './ministerios';
import { usuariosHandlers } from './usuarios';

// Cada dueño agrega aquí los handlers de su módulo (F1 y F2 migrados; F3 y F4 pendientes)
export const handlers = [
  http.get(ruta('/health'), () => HttpResponse.json({ data: { status: 'ok' } })),
  ...authHandlers,
  ...usuariosHandlers,
  ...configuracionHandlers,
  ...miembrosHandlers,
  ...ministeriosHandlers,
];
