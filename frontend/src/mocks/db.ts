import type { ConfiguracionIglesia, HorarioReunion } from '@/app/tipos/configuracion';
import type { Miembro } from '@/app/tipos/miembros';
import type { Usuario } from '@/app/tipos/usuarios';
import { configuracionInicial, horariosIniciales, usuariosIniciales } from './datos/b1';
import {
  type CoordinacionMock,
  coordinacionesIniciales,
  type MinisterioMock,
  miembrosIniciales,
  ministeriosIniciales,
  type VinculoMock,
  vinculosIniciales,
} from './datos/b2';

// "Base de datos" en memoria de los mocks (F1 y F2). F3/F4 agregarán aquí sus colecciones.
export const db = {
  usuarios: usuariosIniciales(),
  configuracion: configuracionInicial(),
  horarios: horariosIniciales(),
  /** Tokens de restablecimiento válidos → id de usuario */
  tokensReset: new Map<string, string>([['token-valido', 'u-pastor']]),
  // F2: miembros, ministerios y sus relaciones
  miembros: miembrosIniciales(),
  ministerios: ministeriosIniciales(),
  vinculos: vinculosIniciales(),
  coordinaciones: coordinacionesIniciales(),
} satisfies {
  usuarios: Usuario[];
  configuracion: ConfiguracionIglesia;
  horarios: HorarioReunion[];
  tokensReset: Map<string, string>;
  miembros: Miembro[];
  ministerios: MinisterioMock[];
  vinculos: VinculoMock[];
  coordinaciones: CoordinacionMock[];
};

/** Restaura los datos iniciales (se llama entre pruebas). */
export function reiniciarDb() {
  db.usuarios = usuariosIniciales();
  db.configuracion = configuracionInicial();
  db.horarios = horariosIniciales();
  db.tokensReset = new Map([['token-valido', 'u-pastor']]);
  db.miembros = miembrosIniciales();
  db.ministerios = ministeriosIniciales();
  db.vinculos = vinculosIniciales();
  db.coordinaciones = coordinacionesIniciales();
  sesionMock.cerrar();
}
// Sesión simulada: en el navegador sobrevive a recargas (como la cookie de refresh real)
const CLAVE_SESION = 'msw:sesion';
let sesionEnMemoria: string | null = null;

export const sesionMock = {
  obtener(): string | null {
    try {
      return sessionStorage.getItem(CLAVE_SESION) ?? sesionEnMemoria;
    } catch {
      return sesionEnMemoria;
    }
  },
  abrir(usuarioId: string) {
    sesionEnMemoria = usuarioId;
    try {
      sessionStorage.setItem(CLAVE_SESION, usuarioId);
    } catch {
      // sin almacenamiento
    }
  },
  cerrar() {
    sesionEnMemoria = null;
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      // sin almacenamiento
    }
  },
};
