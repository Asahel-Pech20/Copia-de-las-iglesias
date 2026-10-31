import { useSesion } from '@/features/auth/contexto';
import type { Permiso } from '@/types/comunes';

/**
 * ¿El usuario tiene el permiso? Con varios permisos basta con tener uno.
 * @example const puedeCrear = usePermiso('miembros:crear');
 */
export function usePermiso(...permisos: Permiso[]): boolean {
  const { permisos: propios } = useSesion();
  return permisos.length === 0 || permisos.some((p) => propios.includes(p));
}
