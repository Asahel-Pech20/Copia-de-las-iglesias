import type { Request, RequestHandler } from 'express';
import { type Reporte, responderReporte } from '../../lib/exportadores/reporte';
import { usuarioDe } from '../../middlewares/auth';
import * as reportesService from './reportes.service';
import type { Generador } from './reportes.service';

type ConFormato = { formato: 'json' | 'pdf' | 'xlsx' };

/** Arma el reporte con el service y lo responde en el formato pedido (?formato=json|pdf|xlsx). */
function generar<Q extends ConFormato>(
  armar: (query: Q, generador: Generador) => Promise<Reporte>,
): RequestHandler {
  return async (req: Request, res) => {
    const query = req.query as unknown as Q;
    const usuario = usuarioDe(req);
    const reporte = await armar(query, {
      id: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
    });
    await responderReporte(res, query.formato, reporte, await reportesService.contexto());
  };
}

export const miembros = generar(reportesService.miembros);
export const asistencia = generar(reportesService.asistencia);
export const ministerios = generar(reportesService.ministerios);
export const ingresos = generar(reportesService.ingresos);
