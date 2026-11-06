import type { Request, RequestHandler } from 'express';
import { AppError } from '../lib/appError';
import { prisma } from '../lib/prisma';
import { usuarioDe } from './auth';

/** Devuelve la iglesia dueña del recurso, leída de la BD; null o undefined si el recurso no existe. */
export type ResolverIglesia = (req: Request) => Promise<string | null | undefined>;

export type ResultadoAlcance = 'PERMITIDO' | 'NO_EXISTE' | 'PROHIBIDO';

/**
 * Regla pura del alcance por iglesia (ADR-0004, RNF-10): el personal solo entra a recursos de su
 * propia iglesia. La Coordinación (sin iglesia) tampoco entra a datos internos de una iglesia.
 */
export function evaluarAlcance(
  iglesiaDelUsuario: string | null,
  iglesiaDelRecurso: string | null | undefined,
): ResultadoAlcance {
  if (iglesiaDelRecurso === null || iglesiaDelRecurso === undefined) return 'NO_EXISTE';
  if (iglesiaDelUsuario === null) return 'PROHIBIDO';
  return iglesiaDelUsuario === iglesiaDelRecurso ? 'PERMITIDO' : 'PROHIBIDO';
}

/**
 * Exige que el recurso pertenezca a la iglesia del usuario. La iglesia del recurso se lee de la BD
 * con `resolver`; nunca se confía en una `iglesiaId` enviada por el cliente.
 * 404 si el recurso no existe y 403 si es de otra iglesia. Va después de `autenticar`.
 * @example router.use('/iglesias/:iglesiaId', autenticar, alcanceIglesia(iglesiaDeLaRuta))
 */
export function alcanceIglesia(resolver: ResolverIglesia): RequestHandler {
  return async function alcanceIglesia(req, _res, next) {
    const usuario = usuarioDe(req);
    const resultado = evaluarAlcance(usuario.iglesiaId, await resolver(req));
    if (resultado === 'NO_EXISTE') throw AppError.noEncontrado('La iglesia no existe.');
    if (resultado === 'PROHIBIDO') throw AppError.prohibido();
    next();
  };
}

/** Resolver para rutas `/iglesias/:iglesiaId/...`: la iglesia del parámetro, si existe en la BD. */
export const iglesiaDeLaRuta: ResolverIglesia = async (req) => {
  const id = req.params['iglesiaId'];
  if (typeof id !== 'string' || id === '') return undefined;
  const iglesia = await prisma.iglesia.findUnique({ where: { id }, select: { id: true } });
  return iglesia?.id;
};
