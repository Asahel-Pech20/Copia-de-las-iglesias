import { http, HttpResponse } from 'msw';
import { ruta } from '../utils';
import { authHandlers } from './auth';
import { configuracionHandlers } from './configuracion';
import { usuariosHandlers } from './usuarios';

// Cada dueño agrega aquí los handlers de su módulo (F2: miembros/ministerios, F3: eventos…, F4: donaciones…)
export const handlers = [
  http.get(ruta('/health'), () => HttpResponse.json({ data: { status: 'ok' } })),
  ...authHandlers,
  ...usuariosHandlers,
  ...configuracionHandlers,
];
