import type { Prisma } from '../../generated/prisma/client';

/** Campos públicos de un usuario. Nunca incluye passwordHash ni tokens (AGENTS.md regla 5). */
export const SELECT_USUARIO = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  ultimoAcceso: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UsuarioSelect;

export type UsuarioPublico = Prisma.UsuarioGetPayload<{ select: typeof SELECT_USUARIO }>;
