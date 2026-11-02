import type { RequestHandler } from 'express';
import { ok, okLista } from '../../lib/respuesta';
import { usuarioDe } from '../../middlewares/auth';
import type { QueryAnuncios } from './anuncios.schemas';
import * as anunciosService from './anuncios.service';

type ConId = { id: string };

export const listar: RequestHandler = async (req, res) => {
  const { datos, meta } = await anunciosService.listar(req.query as unknown as QueryAnuncios);
  res.json(okLista(datos, meta));
};

export const obtener: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await anunciosService.obtener(req.params.id)));
};

export const crear: RequestHandler = async (req, res) => {
  res.status(201).json(ok(await anunciosService.crear(req.body, usuarioDe(req).id)));
};

export const editar: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await anunciosService.editar(req.params.id, req.body)));
};

export const eliminar: RequestHandler<ConId> = async (req, res) => {
  await anunciosService.eliminar(req.params.id);
  res.status(204).end();
};
