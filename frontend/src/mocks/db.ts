import type { ConfiguracionIglesia, HorarioReunion } from '@/types/configuracion';
import type { Usuario } from '@/types/usuarios';
import { configuracionInicial, horariosIniciales, usuariosIniciales } from './datos/b1';

// "Base de datos" en memoria de los mocks. Cada dueño agrega aquí sus colecciones (B2–B4).
export const db = {
  usuarios: usuariosIniciales(),
  configuracion: configuracionInicial(),
  horarios: horariosIniciales(),
  /** Tokens de restablecimiento válidos → id de usuario */
  tokensReset: new Map<string, string>([['token-valido', 'u-pastor']]),
} satisfies {
  usuarios: Usuario[];
  configuracion: ConfiguracionIglesia;
  horarios: HorarioReunion[];
  tokensReset: Map<string, string>;
};

/** Restaura los datos iniciales (se llama entre pruebas). */
export function reiniciarDb() {
  db.usuarios = usuariosIniciales();
  db.configuracion = configuracionInicial();
  db.horarios = horariosIniciales();
  db.tokensReset = new Map([['token-valido', 'u-pastor']]);
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
