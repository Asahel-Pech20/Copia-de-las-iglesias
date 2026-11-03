import type { RequestHandler } from 'express';
import type { RolUsuario } from '../../config/permisos';
import { ok } from '../../lib/respuesta';
import { usuarioDe } from '../../middlewares/auth';
import type { Dashboard } from './dashboard.service';

export const obtener =
  (obtenerDashboard: (rol: RolUsuario) => Promise<Dashboard>): RequestHandler =>
  async (req, res) => {
    res.json(ok(await obtenerDashboard(usuarioDe(req).rol)));
  };
