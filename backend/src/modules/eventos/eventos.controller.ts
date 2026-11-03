import type { RequestHandler } from 'express';
import { ok, okLista } from '../../lib/respuesta';
import { usuarioDe } from '../../middlewares/auth';
import type { QueryEventos } from './eventos.schemas';
import * as eventosService from './eventos.service';

type ConId = { id: string };

export const listar: RequestHandler = async (req, res) => {
  const { datos, meta } = await eventosService.listar(req.query as unknown as QueryEventos);
  res.json(okLista(datos, meta));
};

export const proximos: RequestHandler = async (req, res) => {
  const { limit } = req.query as unknown as { limit: number };
  res.json(ok(await eventosService.proximos(limit)));
};

export const obtener: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await eventosService.obtener(req.params.id)));
};

export const crear: RequestHandler = async (req, res) => {
  res.status(201).json(ok(await eventosService.crear(req.body, usuarioDe(req))));
};

export const editar: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await eventosService.editar(req.params.id, req.body, usuarioDe(req))));
};

export const cancelar: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await eventosService.cancelar(req.params.id, req.body.motivo, usuarioDe(req))));
};

export const asignarResponsables: RequestHandler<ConId> = async (req, res) => {
  const evento = await eventosService.asignarResponsables(
    req.params.id,
    req.body.miembroIds,
    usuarioDe(req),
  );
  res.json(ok(evento));
};
