import type { RolUsuario } from '../config/permisos';

declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado; lo carga el middleware `autenticar`. */
      usuario?: {
        id: string;
        nombre: string;
        email: string;
        rol: RolUsuario;
      };
    }
  }
}

export {};
