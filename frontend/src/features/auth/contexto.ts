import { createContext, useContext } from 'react';
import type { Permiso } from '@/types/comunes';
import type { Usuario } from '@/types/usuarios';

export type EstadoSesion = 'cargando' | 'autenticado' | 'anonimo';

export interface ValorSesion {
  estado: EstadoSesion;
  usuario: Usuario | null;
  permisos: readonly Permiso[];
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

export const ContextoSesion = createContext<ValorSesion | null>(null);

/** Sesión actual: usuario, permisos, iniciarSesion y cerrarSesion. */
export function useSesion() {
  const valor = useContext(ContextoSesion);
  if (!valor) throw new Error('useSesion debe usarse dentro de <AuthProvider>');
  return valor;
}
