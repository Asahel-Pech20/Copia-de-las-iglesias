import type { RequestHandler } from 'express';
import { ok, okLista } from '../../lib/respuesta';
import { usuarioDe } from '../../middlewares/auth';
import type { QueryUsuarios } from './usuarios.schemas';
import * as usuariosService from './usuarios.service';

type ConId = { id: string };

export const listar: RequestHandler = async (req, res) => {
  const { datos, meta } = await usuariosService.listar(req.query as unknown as QueryUsuarios);
  res.json(okLista(datos, meta));
};

export const opciones: RequestHandler = async (req, res) => {
  const { rol } = req.query as { rol?: QueryUsuarios['rol'] };
  res.json(ok(await usuariosService.opciones(rol)));
};

export const obtener: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await usuariosService.obtener(req.params.id)));
};

export const crear: RequestHandler = async (req, res) => {
  res.status(201).json(ok(await usuariosService.crear(req.body)));
};

export const editar: RequestHandler<ConId> = async (req, res) => {
  res.json(ok(await usuariosService.editar(req.params.id, req.body)));
};

export const cambiarEstado: RequestHandler<ConId> = async (req, res) => {
  const usuario = await usuariosService.cambiarEstado(
    req.params.id,
    req.body.activo,
    usuarioDe(req).id,
  );
  res.json(ok(usuario));
};

export const reenviarInvitacion: RequestHandler<ConId> = async (req, res) => {
  await usuariosService.reenviarInvitacion(req.params.id);
  res.status(204).end();
};
