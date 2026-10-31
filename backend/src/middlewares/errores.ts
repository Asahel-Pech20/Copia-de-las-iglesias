import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError, type CodigoError, type DetalleError } from '../lib/appError';

interface ErrorPrisma {
  name: string;
  code: string;
  meta?: { target?: string[] | string; modelName?: string };
}

function esErrorPrisma(err: unknown): err is ErrorPrisma {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as ErrorPrisma).name === 'PrismaClientKnownRequestError' &&
    typeof (err as ErrorPrisma).code === 'string'
  );
}

function cuerpo(code: CodigoError, message: string, details?: unknown) {
  return { error: { code, message, ...(details !== undefined && { details }) } };
}

// Ruta no encontrada dentro de la API
export const noEncontrado: RequestHandler = (req, res) => {
  res.status(404).json(cuerpo('NOT_FOUND', `La ruta ${req.method} ${req.path} no existe.`));
};

// Único punto donde los errores se convierten en respuesta HTTP (AGENTS.md §3)
export const manejarErrores: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json(cuerpo(err.code, err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details: DetalleError[] = err.issues.map((issue) => ({
      campo: issue.path.join('.') || undefined,
      mensaje: issue.message,
    }));
    res.status(400).json(cuerpo('VALIDATION_ERROR', 'Los datos enviados no son válidos.', details));
    return;
  }

  if (esErrorPrisma(err)) {
    if (err.code === 'P2002') {
      const campos = [err.meta?.target].flat().filter(Boolean).join(', ');
      res
        .status(409)
        .json(
          cuerpo('CONFLICT', `Ya existe un registro con ese valor${campos ? ` (${campos})` : ''}.`),
        );
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json(cuerpo('NOT_FOUND', 'El recurso solicitado no existe.'));
      return;
    }
  }

  // JSON mal formado en el body
  if ((err as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json(cuerpo('VALIDATION_ERROR', 'El cuerpo de la petición no es JSON válido.'));
    return;
  }

  req.log?.error({ err }, 'Error no controlado');
  const detalle = env.NODE_ENV === 'production' ? undefined : { stack: (err as Error).stack };
  res.status(500).json(cuerpo('INTERNAL_ERROR', 'Ocurrió un error inesperado.', detalle));
};
