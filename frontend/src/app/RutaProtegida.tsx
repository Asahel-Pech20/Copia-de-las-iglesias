import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSesion } from '@/features/auth/contexto';
import { usePermiso } from '@/hooks/usePermiso';
import { SinAccesoPage } from '@/pages/SinAccesoPage';
import type { Permiso } from '@/types/comunes';

interface RutaProtegidaProps {
  /** Permiso requerido; sin permiso basta con estar autenticado */
  permiso?: Permiso | Permiso[];
  children: ReactNode;
}

/**
 * Exige sesión (si no, redirige a /login?redirect=) y, opcionalmente, un permiso (si no, 403).
 * @example <RutaProtegida permiso="usuarios:leer"><UsuariosPage /></RutaProtegida>
 */
export function RutaProtegida({ permiso, children }: RutaProtegidaProps) {
  const { estado } = useSesion();
  const ubicacion = useLocation();
  const permitido = usePermiso(...(permiso ? [permiso].flat() : []));

  if (estado === 'anonimo') {
    const destino = encodeURIComponent(ubicacion.pathname + ubicacion.search);
    return <Navigate to={`/login?redirect=${destino}`} replace />;
  }
  if (estado === 'cargando') return null;
  if (!permitido) return <SinAccesoPage />;
  return <>{children}</>;
}
