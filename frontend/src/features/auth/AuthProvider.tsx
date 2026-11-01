import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { guardarToken, refrescarToken, registrarAlExpirarSesion } from '@/lib/api';
import type { Sesion } from '@/types/usuarios';
import * as authApi from './api';
import { ContextoSesion, type EstadoSesion } from './contexto';

/**
 * Sesión del usuario. El access token vive solo en memoria (lib/api.ts);
 * al cargar la página se recupera con la cookie httpOnly de refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<EstadoSesion>('cargando');
  const [sesion, setSesion] = useState<Sesion | null>(null);

  const limpiar = useCallback(() => {
    guardarToken(null);
    setSesion(null);
    setEstado('anonimo');
    queryClient.clear();
  }, [queryClient]);

  // Restaurar sesión al cargar (recargar la página no cierra sesión)
  useEffect(() => {
    let cancelado = false;
    refrescarToken()
      .then(() => authApi.obtenerSesion())
      .then((datos) => {
        if (cancelado) return;
        setSesion(datos);
        setEstado('autenticado');
      })
      .catch(() => {
        if (!cancelado) setEstado('anonimo');
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Si un refresh falla a mitad de uso, se cierra la sesión
  useEffect(() => {
    registrarAlExpirarSesion(limpiar);
    return () => registrarAlExpirarSesion(null);
  }, [limpiar]);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const { accessToken, ...datos } = await authApi.login(email, password);
    guardarToken(accessToken);
    setSesion(datos);
    setEstado('autenticado');
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      limpiar();
    }
  }, [limpiar]);

  const valor = useMemo(
    () => ({
      estado,
      usuario: sesion?.usuario ?? null,
      permisos: sesion?.permisos ?? [],
      iniciarSesion,
      cerrarSesion,
    }),
    [estado, sesion, iniciarSesion, cerrarSesion],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}
