import type { RequestHandler } from 'express';
import { ok, okLista } from '../../lib/respuesta';
import { usuarioDe } from '../../middlewares/auth';
import type { QueryHistorial, QueryResumen } from './asistencia.schemas';
import * as asistenciaService from './asistencia.service';

type ConId = { id: string };

export const listaDeEvento: RequestHandler<ConId> = async (req, res) => {
  const { q } = req.query as { q?: string };
  res.json(ok(await asistenciaService.listaDeEvento(req.params.id, usuarioDe(req), q)));
};

export const registrar: RequestHandler<ConId> = async (req, res) => {
  const lista = await asistenciaService.registrar(
    req.params.id,
    req.body.registros,
    usuarioDe(req),
  );
  res.json(ok(lista));
};

export const historial: RequestHandler = async (req, res) => {
  const { datos, meta } = await asistenciaService.historial(
    req.query as unknown as QueryHistorial,
    usuarioDe(req),
  );
  res.json(okLista(datos, meta));
};

export const resumen: RequestHandler = async (req, res) => {
  const serie = await asistenciaService.resumen(
    req.query as unknown as QueryResumen,
    usuarioDe(req),
  );
  res.json(ok(serie));
};
