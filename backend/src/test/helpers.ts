import { randomUUID } from 'node:crypto';
import type { RolUsuario } from '../config/permisos';
import { prisma } from '../lib/prisma';
import { firmarAccessToken, hashPassword } from '../lib/seguridad';

export const PASSWORD_PRUEBA = 'Prueba123';

/** Crea un usuario en la BD de pruebas. */
export async function crearUsuario(
  rol: RolUsuario,
  datos: { nombre?: string; email?: string; activo?: boolean; password?: string | null } = {},
) {
  const password = datos.password === undefined ? PASSWORD_PRUEBA : datos.password;
  return prisma.usuario.create({
    data: {
      rol,
      nombre: datos.nombre ?? `Usuario ${rol}`,
      email: datos.email ?? `${rol.toLowerCase()}-${randomUUID().slice(0, 8)}@prueba.local`,
      activo: datos.activo ?? true,
      passwordHash: password === null ? null : await hashPassword(password),
    },
  });
}

/**
 * Crea un usuario con ese rol y devuelve su cabecera Authorization lista para Supertest.
 * @example const { auth } = await loginComo('ADMIN'); request(app).get('/api/v1/usuarios').set('Authorization', auth)
 */
export async function loginComo(rol: RolUsuario, datos?: Parameters<typeof crearUsuario>[1]) {
  const usuario = await crearUsuario(rol, datos);
  const token = firmarAccessToken({ sub: usuario.id, rol: usuario.rol });
  return { usuario, token, auth: `Bearer ${token}` };
}
