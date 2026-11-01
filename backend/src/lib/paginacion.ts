import { z } from 'zod';

export const LIMIT_DEFAULT = 20;
export const MAX_LIMIT = 100;

// Campos de query comunes a todos los listados: ?page=1&limit=20&q=&orden=campo:asc
export const esquemaPaginacion = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(LIMIT_DEFAULT),
  q: z.string().trim().min(1).optional(),
  orden: z
    .string()
    .regex(/^[a-zA-Z]+:(asc|desc)$/, 'Formato esperado: campo:asc o campo:desc')
    .optional(),
});

export type QueryPaginacion = z.infer<typeof esquemaPaginacion>;

export interface MetaPaginacion {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Convierte page/limit a skip/take de Prisma
export function paginar(query: Pick<QueryPaginacion, 'page' | 'limit'>) {
  const page = Math.max(1, Math.trunc(query.page ?? 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.trunc(query.limit ?? LIMIT_DEFAULT)));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function crearMeta(total: number, page: number, limit: number): MetaPaginacion {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

// Traduce "campo:asc" a { campo: 'asc' } validando contra los campos permitidos
export function ordenar<C extends string>(
  orden: string | undefined,
  permitidos: readonly C[],
  porDefecto: { [K in C]?: 'asc' | 'desc' },
): { [K in C]?: 'asc' | 'desc' } {
  if (!orden) return porDefecto;
  const [campo, direccion] = orden.split(':') as [string, 'asc' | 'desc'];
  if (!permitidos.includes(campo as C)) return porDefecto;
  return { [campo]: direccion } as { [K in C]?: 'asc' | 'desc' };
}
