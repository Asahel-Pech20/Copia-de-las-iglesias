// PLANTILLA — el controller solo lee req, llama al service y responde con ok()/okLista().
// Sin lógica de negocio y sin Prisma. Los errores los convierte errores.ts (Express 5 captura los async).
import type { RequestHandler } from 'express';
import { ok, okLista } from '../../lib/respuesta';
import type { QueryListar } from './_plantilla.schemas';
import * as service from './_plantilla.service';

export const listar: RequestHandler = async (req, res) => {
  const { datos, meta } = await service.listar(req.query as unknown as QueryListar);
  res.json(okLista(datos, meta));
};

export const obtener: RequestHandler<{ id: string }> = async (req, res) => {
  res.json(ok(await service.obtener(req.params.id)));
};
