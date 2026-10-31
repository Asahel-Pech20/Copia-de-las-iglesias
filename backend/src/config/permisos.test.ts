import { describe, expect, it } from 'vitest';
import { PERMISOS, PERMISOS_POR_ROL, ROLES, type RolUsuario, tienePermiso } from './permisos';

// Transcripción literal de la tabla de specs.md §3.
// Leyenda: C crear · L leer · E editar · D eliminar · minúscula = solo "propio" · — sin acceso.
const MATRIZ: Record<string, Record<RolUsuario, string>> = {
  usuarios: { ADMIN: 'CLED', PASTOR: '—', SECRETARIO: '—', TESORERO: '—', COORDINADOR: '—' },
  configuracion: { ADMIN: 'LE', PASTOR: 'L', SECRETARIO: 'L', TESORERO: 'L', COORDINADOR: 'L' },
  miembros: { ADMIN: 'CLED', PASTOR: 'CLED', SECRETARIO: 'CLED', TESORERO: 'L', COORDINADOR: 'L' },
  ministerios: { ADMIN: 'CLED', PASTOR: 'CLED', SECRETARIO: 'L', TESORERO: 'L', COORDINADOR: 'Le' },
  eventos: {
    ADMIN: 'CLED',
    PASTOR: 'CLED',
    SECRETARIO: 'CLED',
    TESORERO: 'L',
    COORDINADOR: 'Lced',
  },
  asistencia: { ADMIN: 'CLE', PASTOR: 'CLE', SECRETARIO: 'CLE', TESORERO: '—', COORDINADOR: 'cle' },
  anuncios: { ADMIN: 'CLED', PASTOR: 'CLED', SECRETARIO: 'CLED', TESORERO: 'L', COORDINADOR: 'L' },
  donaciones: { ADMIN: 'CLED', PASTOR: 'L', SECRETARIO: '—', TESORERO: 'CLED', COORDINADOR: '—' },
};

const ACCIONES: Record<string, string> = { C: 'crear', L: 'leer', E: 'editar', D: 'eliminar' };

// Fila "Reportes" y "Dashboard" de la tabla
const REPORTES_GENERALES: Record<RolUsuario, 'si' | 'propio' | 'no'> = {
  ADMIN: 'si',
  PASTOR: 'si',
  SECRETARIO: 'si',
  TESORERO: 'no',
  COORDINADOR: 'propio',
};
const REPORTES_INGRESOS: RolUsuario[] = ['ADMIN', 'PASTOR', 'TESORERO'];
const DASHBOARD_CON_INGRESOS: RolUsuario[] = ['ADMIN', 'PASTOR', 'TESORERO'];

describe('matriz de permisos (specs.md §3)', () => {
  for (const [modulo, fila] of Object.entries(MATRIZ)) {
    for (const rol of ROLES) {
      it(`${modulo} · ${rol} = ${fila[rol]}`, () => {
        const celda = fila[rol];
        for (const [letra, accion] of Object.entries(ACCIONES)) {
          const completo = celda.includes(letra);
          const propio = celda.includes(letra.toLowerCase());
          expect(tienePermiso(rol, `${modulo}:${accion}` as never)).toBe(completo);
          const permisoPropio = `${modulo}:${accion}-propio`;
          if ((PERMISOS as readonly string[]).includes(permisoPropio)) {
            expect(tienePermiso(rol, permisoPropio as never)).toBe(propio);
          } else {
            expect(propio).toBe(false);
          }
        }
      });
    }
  }

  it('reportes de miembros/asistencia/ministerios', () => {
    for (const rol of ROLES) {
      expect(tienePermiso(rol, 'reportes:generales')).toBe(REPORTES_GENERALES[rol] === 'si');
      expect(tienePermiso(rol, 'reportes:generales-propio')).toBe(
        REPORTES_GENERALES[rol] === 'propio',
      );
    }
  });

  it('reportes de ingresos', () => {
    for (const rol of ROLES) {
      expect(tienePermiso(rol, 'reportes:ingresos')).toBe(REPORTES_INGRESOS.includes(rol));
    }
  });

  it('dashboard: todos lo ven; ingresos solo con donaciones:leer', () => {
    for (const rol of ROLES) {
      expect(tienePermiso(rol, 'dashboard:leer')).toBe(true);
      expect(tienePermiso(rol, 'donaciones:leer')).toBe(DASHBOARD_CON_INGRESOS.includes(rol));
    }
  });

  it('usuarios:opciones solo para ADMIN y PASTOR (specs.md §7.2)', () => {
    expect(ROLES.filter((rol) => tienePermiso(rol, 'usuarios:opciones'))).toEqual([
      'ADMIN',
      'PASTOR',
    ]);
  });

  it('cada permiso asignado existe y no hay duplicados', () => {
    for (const rol of ROLES) {
      const lista = PERMISOS_POR_ROL[rol];
      expect(new Set(lista).size).toBe(lista.length);
      for (const permiso of lista) expect(PERMISOS).toContain(permiso);
    }
  });

  it('todo permiso declarado lo tiene al menos un rol', () => {
    for (const permiso of PERMISOS) {
      expect(ROLES.some((rol) => tienePermiso(rol, permiso))).toBe(true);
    }
  });
});
