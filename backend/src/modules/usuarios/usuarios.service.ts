import type { RolUsuario } from '../../config/permisos';
import type { Prisma } from '../../generated/prisma/client';
import { AppError } from '../../lib/appError';
import { enviarCorreo, plantillaEnlace } from '../../lib/mailer';
import { crearMeta, ordenar, paginar } from '../../lib/paginacion';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/seguridad';
import { crearTokenEnlace, revocarSesiones } from '../auth/auth.service';
import type { CrearUsuario, EditarUsuario, QueryUsuarios } from './usuarios.schemas';
import { SELECT_USUARIO } from './usuarios.select';

const CORREO_DUPLICADO = 'El correo ya está registrado.';
const ULTIMO_ADMIN = 'Debe existir al menos un administrador activo.';
const HORAS_INVITACION = 48;

async function verificarEmailLibre(email: string, exceptoId?: string) {
  const otro = await prisma.usuario.findUnique({ where: { email }, select: { id: true } });
  if (otro && otro.id !== exceptoId) {
    throw AppError.conflicto(CORREO_DUPLICADO, [{ campo: 'email', mensaje: CORREO_DUPLICADO }]);
  }
}

async function obtenerOFallar(id: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { ...SELECT_USUARIO, passwordHash: true },
  });
  if (!usuario) throw AppError.noEncontrado('El usuario no existe.');
  return usuario;
}

/** Lanza 422 si el cambio dejaría el sistema sin administradores activos. */
async function protegerUltimoAdmin(usuario: { rol: RolUsuario; activo: boolean }) {
  if (usuario.rol !== 'ADMIN' || !usuario.activo) return;
  const activos = await prisma.usuario.count({ where: { rol: 'ADMIN', activo: true } });
  if (activos <= 1) throw AppError.reglaNegocio(ULTIMO_ADMIN);
}

async function enviarInvitacion(usuario: { id: string; nombre: string; email: string }) {
  const enlace = await crearTokenEnlace(usuario.id, HORAS_INVITACION);
  await enviarCorreo({
    para: usuario.email,
    asunto: 'Configura tu contraseña',
    ...plantillaEnlace({
      saludo: `Hola, ${usuario.nombre}:`,
      mensaje:
        'Se creó tu cuenta en el sistema de la iglesia. Configura tu contraseña para entrar.',
      textoBoton: 'Configurar contraseña',
      enlace,
      pie: `El enlace vence en ${HORAS_INVITACION} horas.`,
    }),
  });
}

export async function listar(query: QueryUsuarios) {
  const { page, limit, skip, take } = paginar(query);
  const where: Prisma.UsuarioWhereInput = {
    ...(query.q && {
      OR: [
        { nombre: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
      ],
    }),
    ...(query.rol && { rol: query.rol }),
    ...(query.activo !== undefined && { activo: query.activo }),
  };
  const orderBy = ordenar(query.orden, ['nombre', 'email', 'rol', 'createdAt', 'ultimoAcceso'], {
    nombre: 'asc',
  });
  const [datos, total] = await Promise.all([
    prisma.usuario.findMany({ where, orderBy, skip, take, select: SELECT_USUARIO }),
    prisma.usuario.count({ where }),
  ]);
  return { datos, meta: crearMeta(total, page, limit) };
}

export async function obtener(id: string) {
  const { passwordHash: _omitido, ...usuario } = await obtenerOFallar(id);
  return usuario;
}

/** Usuarios activos para selectores (p. ej. coordinadores de ministerio). */
export function opciones(rol?: RolUsuario) {
  return prisma.usuario.findMany({
    where: { activo: true, ...(rol && { rol }) },
    select: { id: true, nombre: true, rol: true },
    orderBy: { nombre: 'asc' },
  });
}

export async function crear(datos: CrearUsuario) {
  await verificarEmailLibre(datos.email);
  const usuario = await prisma.usuario.create({
    data: {
      nombre: datos.nombre,
      email: datos.email,
      rol: datos.rol,
      passwordHash: datos.password ? await hashPassword(datos.password) : null,
    },
    select: SELECT_USUARIO,
  });
  if (!datos.password) await enviarInvitacion(usuario);
  return usuario;
}

export async function editar(id: string, datos: EditarUsuario) {
  const actual = await obtenerOFallar(id);
  if (datos.email) await verificarEmailLibre(datos.email, id);
  if (datos.rol && datos.rol !== 'ADMIN') await protegerUltimoAdmin(actual);
  return prisma.usuario.update({ where: { id }, data: datos, select: SELECT_USUARIO });
}

export async function cambiarEstado(id: string, activo: boolean, solicitanteId: string) {
  const actual = await obtenerOFallar(id);
  if (!activo) {
    if (id === solicitanteId) throw AppError.reglaNegocio('No puedes desactivar tu propia cuenta.');
    await protegerUltimoAdmin(actual);
  }
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.update({
      where: { id },
      data: { activo },
      select: SELECT_USUARIO,
    });
    // Usuario desactivado ⇒ se cierran todas sus sesiones (AGENTS.md §3)
    if (!activo) await revocarSesiones(id, tx);
    return usuario;
  });
}

export async function reenviarInvitacion(id: string) {
  const usuario = await obtenerOFallar(id);
  if (!usuario.activo) throw AppError.reglaNegocio('El usuario está desactivado.');
  if (usuario.passwordHash) {
    throw AppError.reglaNegocio('El usuario ya configuró su contraseña.');
  }
  await enviarInvitacion(usuario);
}
