import type { RequestHandler } from 'express';
import { ok } from '../../lib/respuesta';
import * as configuracionService from './configuracion.service';

type ConId = { id: string };

export const obtener: RequestHandler = async (_req, res) => {
  res.json(ok(await configuracionService.obtener()));
};

export const actualizar: RequestHandler = async (req, res) => {
  res.json(ok(await configuracionService.actualizar(req.body)));
};

export const subirLogo: RequestHandler = async (req, res) => {
  res.json(ok(await configuracionService.guardarLogo(req.file)));
};

export const listarHorarios: RequestHandler = async (_req, res) => {
  res.json(ok(await configuracionService.listarHorarios()));
};

export const crearHorario: RequestHandler = async (req, res) => {
  res.status(201).json(ok(await configuracionService.crearHorario(req.body)));
};

export const editarHorario: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await configuracionService.editarHorario(req.params.id, req.body)));
};

export const eliminarHorario: RequestHandler<ConId> = async (req, res) => {
  await configuracionService.eliminarHorario(req.params.id);
  res.status(204).end();
};
