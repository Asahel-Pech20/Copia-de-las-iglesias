import { useSesion } from '@/features/auth/contexto';
import { useMinisterios } from '@/features/ministerios/hooks';
import { usePermiso } from '@/hooks/usePermiso';
import type { Permiso } from '@/types/comunes';

/** Ids de los ministerios activos que coordina el usuario actual (para las reglas "-propio"). */
export function useMinisteriosCoordinados() {
  const { usuario } = useSesion();
  const { data } = useMinisterios();
  return (data?.data ?? [])
    .filter((m) => m.coordinadores.some((c) => c.id === usuario?.id))
    .map((m) => m.id);
}

/**
 * ¿Puede gestionar eventos/asistencia de ese ministerio? Permiso completo siempre;
 * la variante "-propio" (COORDINADOR) solo en sus ministerios. El backend lo vuelve a validar.
 * @example const puede = usePuedeGestionar('eventos:editar', 'eventos:editar-propio'); puede(evento.ministerio?.id)
 */
export function usePuedeGestionar(completo: Permiso, propio: Permiso) {
  const tieneCompleto = usePermiso(completo);
  const tienePropio = usePermiso(propio);
  const coordinados = useMinisteriosCoordinados();
  return (ministerioId: string | null | undefined) =>
    tieneCompleto || (tienePropio && Boolean(ministerioId) && coordinados.includes(ministerioId!));
}
