import type { RequestHandler } from 'express';
import { ok, okLista } from '../../lib/respuesta';
import { usuarioDe } from '../../middlewares/auth';
import type { QueryDonaciones, QueryResumen, QueryResumenMensual } from './donaciones.schemas';
import * as donacionesService from './donaciones.service';

type ConId = { id: string };

export const listar: RequestHandler = async (req, res) => {
  const { datos, meta } = await donacionesService.listar(req.query as unknown as QueryDonaciones);
  res.json(okLista(datos, meta));
};

export const resumen: RequestHandler = async (req, res) => {
  res.json(ok(await donacionesService.resumen(req.query as unknown as QueryResumen)));
};

export const resumenMensual: RequestHandler = async (req, res) => {
  const query = req.query as unknown as QueryResumenMensual;
  res.json(ok(await donacionesService.resumenMensual(query)));
};

export const obtener: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await donacionesService.obtener(req.params.id)));
};

export const crear: RequestHandler = async (req, res) => {
  res.status(201).json(ok(await donacionesService.crear(req.body, usuarioDe(req))));
};

export const editar: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await donacionesService.editar(req.params.id, req.body, usuarioDe(req))));
};

export const anular: RequestHandler<ConId> = async (req, res) => {
  const donacion = await donacionesService.anular(req.params.id, req.body.motivo, usuarioDe(req));
  res.json(ok(donacion));
};
