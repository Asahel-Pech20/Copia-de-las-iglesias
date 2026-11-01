import type { Permiso, QueryLista, Rol } from './comunes';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  ultimoAcceso: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /auth/me */
export interface Sesion {
  usuario: Usuario;
  permisos: Permiso[];
}

/** POST /auth/login */
export interface RespuestaLogin extends Sesion {
  accessToken: string;
}

/** POST /auth/refresh */
export interface RespuestaRefresh {
  accessToken: string;
}

export interface QueryUsuarios extends QueryLista {
  rol?: Rol;
  activo?: boolean;
}

export interface CrearUsuario {
  nombre: string;
  email: string;
  rol: Rol;
}

export type EditarUsuario = Partial<CrearUsuario>;

/** GET /usuarios/opciones */
export interface OpcionUsuario {
  id: string;
  nombre: string;
  rol: Rol;
}
