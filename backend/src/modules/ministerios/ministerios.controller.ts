import type { RequestHandler } from 'express';
import { ok, okLista } from '../../lib/respuesta';
import { usuarioDe } from '../../middlewares/auth';
import type { QueryIntegrantes, QueryMinisterios } from './ministerios.schemas';
import * as ministeriosService from './ministerios.service';

type ConId = { id: string };

export const listar: RequestHandler = async (req, res) => {
  const { datos, meta } = await ministeriosService.listar(req.query as unknown as QueryMinisterios);
  res.json(okLista(datos, meta));
};

export const obtener: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await ministeriosService.obtener(req.params.id)));
};

export const crear: RequestHandler = async (req, res) => {
  res.status(201).json(ok(await ministeriosService.crear(req.body)));
};

export const editar: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await ministeriosService.editar(req.params.id, req.body)));
};

export const cambiarEstado: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await ministeriosService.cambiarEstado(req.params.id, req.body.activo)));
};

export const asignarCoordinadores: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await ministeriosService.asignarCoordinadores(req.params.id, req.body.usuarioIds)));
};

export const listarIntegrantes: RequestHandler<ConId> = async (req, res) => {
  const { datos, meta } = await ministeriosService.listarIntegrantes(
    req.params.id,
    req.query as unknown as QueryIntegrantes,
  );
  res.json(okLista(datos, meta));
};

export const vincularMiembros: RequestHandler<ConId> = async (req, res) => {
  const ministerio = await ministeriosService.vincularMiembros(
    req.params.id,
    req.body.miembroIds,
    usuarioDe(req),
  );
  res.json(ok(ministerio));
};

export const desvincularMiembro: RequestHandler<ConId & { miembroId: string }> = async (
  req,
  res,
) => {
  await ministeriosService.desvincularMiembro(req.params.id, req.params.miembroId, usuarioDe(req));
  res.status(204).end();
};
