// PLANTILLA — el service tiene toda la lógica y es el único que usa Prisma.
// Lanza AppError (validacion, noEncontrado, conflicto, reglaNegocio…) en lugar de responder HTTP.
// El ejemplo lista horarios de reunión solo para tener datos reales; tu módulo usará su propio modelo.
import { AppError } from '../../lib/appError';
import { crearMeta, ordenar, paginar } from '../../lib/paginacion';
import { prisma } from '../../lib/prisma';
import type { QueryListar } from './_plantilla.schemas';

// select explícito: nunca devolver campos internos
const SELECT = { id: true, nombre: true, diaSemana: true, horaInicio: true, activo: true } as const;

export async function listar(query: QueryListar) {
  const { page, limit, skip, take } = paginar(query);
  const where = {
    ...(query.q && { nombre: { contains: query.q, mode: 'insensitive' as const } }),
    ...(query.activo !== undefined && { activo: query.activo }),
  };
  const orderBy = ordenar(query.orden, ['nombre', 'diaSemana'], { nombre: 'asc' });
  // Lecturas en paralelo con Promise.all (no $transaction([...]): con el adaptador pg manda
  // las consultas a la vez por una sola conexión y pg avisa que en la v9 será un error)
  const [datos, total] = await Promise.all([
    prisma.horarioReunion.findMany({ where, orderBy, skip, take, select: SELECT }),
    prisma.horarioReunion.count({ where }),
  ]);
  return { datos, meta: crearMeta(total, page, limit) };
}

export async function obtener(id: string) {
  const registro = await prisma.horarioReunion.findUnique({ where: { id }, select: SELECT });
  if (!registro) throw AppError.noEncontrado('El registro no existe.');
  return registro;
}
