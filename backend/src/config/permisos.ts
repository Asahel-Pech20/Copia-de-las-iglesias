// Matriz de permisos — fuente única: specs.md §3.
// frontend/src/lib/permisos.ts es una copia exacta de PERMISOS y PERMISOS_POR_ROL (F1).
// Sufijo "-propio": solo sobre ministerios donde el usuario es coordinador (ver esCoordinadorDe).

export const ROLES = ['ADMIN', 'PASTOR', 'SECRETARIO', 'TESORERO', 'COORDINADOR'] as const;
export type RolUsuario = (typeof ROLES)[number];

export const PERMISOS = [
  'usuarios:crear',
  'usuarios:leer',
  'usuarios:editar',
  'usuarios:eliminar',
  'usuarios:opciones',
  'configuracion:leer',
  'configuracion:editar',
  'miembros:crear',
  'miembros:leer',
  'miembros:editar',
  'miembros:eliminar',
  'ministerios:crear',
  'ministerios:leer',
  'ministerios:editar',
  'ministerios:eliminar',
  'ministerios:editar-propio',
  'eventos:crear',
  'eventos:leer',
  'eventos:editar',
  'eventos:eliminar',
  'eventos:crear-propio',
  'eventos:editar-propio',
  'eventos:eliminar-propio',
  'asistencia:crear',
  'asistencia:leer',
  'asistencia:editar',
  'asistencia:crear-propio',
  'asistencia:leer-propio',
  'asistencia:editar-propio',
  'anuncios:crear',
  'anuncios:leer',
  'anuncios:editar',
  'anuncios:eliminar',
  'donaciones:crear',
  'donaciones:leer',
  'donaciones:editar',
  'donaciones:eliminar',
  'dashboard:leer',
  'reportes:generales',
  'reportes:generales-propio',
  'reportes:ingresos',
] as const;

export type Permiso = (typeof PERMISOS)[number];

const CLED = (modulo: string) =>
  ['crear', 'leer', 'editar', 'eliminar'].map((accion) => `${modulo}:${accion}`) as Permiso[];

export const PERMISOS_POR_ROL: Record<RolUsuario, readonly Permiso[]> = {
  ADMIN: [
    ...CLED('usuarios'),
    'usuarios:opciones',
    'configuracion:leer',
    'configuracion:editar',
    ...CLED('miembros'),
    ...CLED('ministerios'),
    ...CLED('eventos'),
    'asistencia:crear',
    'asistencia:leer',
    'asistencia:editar',
    ...CLED('anuncios'),
    ...CLED('donaciones'),
    'dashboard:leer',
    'reportes:generales',
    'reportes:ingresos',
  ],
  PASTOR: [
    'usuarios:opciones',
    'configuracion:leer',
    ...CLED('miembros'),
    ...CLED('ministerios'),
    ...CLED('eventos'),
    'asistencia:crear',
    'asistencia:leer',
    'asistencia:editar',
    ...CLED('anuncios'),
    'donaciones:leer',
    'dashboard:leer',
    'reportes:generales',
    'reportes:ingresos',
  ],
  SECRETARIO: [
    'configuracion:leer',
    ...CLED('miembros'),
    'ministerios:leer',
    ...CLED('eventos'),
    'asistencia:crear',
    'asistencia:leer',
    'asistencia:editar',
    ...CLED('anuncios'),
    'dashboard:leer',
    'reportes:generales',
  ],
  TESORERO: [
    'configuracion:leer',
    'miembros:leer',
    'ministerios:leer',
    'eventos:leer',
    'anuncios:leer',
    ...CLED('donaciones'),
    'dashboard:leer',
    'reportes:ingresos',
  ],
  COORDINADOR: [
    'configuracion:leer',
    'miembros:leer',
    'ministerios:leer',
    'ministerios:editar-propio',
    'eventos:leer',
    'eventos:crear-propio',
    'eventos:editar-propio',
    'eventos:eliminar-propio',
    'asistencia:crear-propio',
    'asistencia:leer-propio',
    'asistencia:editar-propio',
    'anuncios:leer',
    'dashboard:leer',
    'reportes:generales-propio',
  ],
};

export function permisosDe(rol: RolUsuario): readonly Permiso[] {
  return PERMISOS_POR_ROL[rol];
}

export function tienePermiso(rol: RolUsuario, permiso: Permiso): boolean {
  return PERMISOS_POR_ROL[rol].includes(permiso);
}
