import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import type { RolUsuario } from '../config/permisos';
import { AppError } from './appError';

// ───────── Contraseñas ─────────

/** Mínimo 8 caracteres, al menos una letra y un número (AGENTS.md §3). */
export const esquemaPassword = z
  .string()
  .min(8, 'Mínimo 8 caracteres.')
  .max(72, 'Máximo 72 caracteres.')
  .regex(/[a-zA-Z]/, 'Debe incluir al menos una letra.')
  .regex(/\d/, 'Debe incluir al menos un número.');

export function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_COST);
}

export function verificarPassword(password: string, hash: string | null) {
  // Usuario sin contraseña (invitación pendiente): nunca coincide
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(password, hash);
}

// ───────── Tokens aleatorios (refresh, reset) ─────────

/** 32 bytes aleatorios en hex; en BD solo se guarda su hash. */
export function generarTokenAleatorio() {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

/** Convierte "15m", "7d", "48h" a milisegundos. */
export function duracionMs(texto: string): number {
  const m = /^(\d+)\s*(s|m|h|d)$/.exec(texto.trim());
  if (!m) throw new Error(`Duración inválida: ${texto}`);
  const factor = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    m[2] as 's' | 'm' | 'h' | 'd'
  ];
  return Number(m[1]) * factor;
}

// ───────── JWT de acceso ─────────

export interface PayloadAcceso {
  sub: string;
  rol: RolUsuario;
}

export function firmarAccessToken(payload: PayloadAcceso) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: Math.floor(duracionMs(env.JWT_ACCESS_TTL) / 1000),
  });
}

/** Lanza 401 TOKEN_EXPIRED si expiró, 401 UNAUTHENTICATED si es inválido. */
export function verificarAccessToken(token: string): PayloadAcceso {
  try {
    const datos = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    if (typeof datos.sub !== 'string' || typeof datos.rol !== 'string') {
      throw AppError.noAutenticado();
    }
    return { sub: datos.sub, rol: datos.rol as RolUsuario };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('TOKEN_EXPIRED', 'La sesión expiró.', 401);
    }
    throw AppError.noAutenticado('Token de acceso inválido.');
  }
}
