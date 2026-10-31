import type { ReactNode } from 'react';
import { usePermiso } from '@/hooks/usePermiso';
import type { Permiso } from '@/types/comunes';

interface PuedeProps {
  /** Permiso requerido; con un arreglo basta con tener uno */
  permiso: Permiso | Permiso[];
  children: ReactNode;
  /** Qué mostrar si no tiene permiso (por defecto nada) */
  sino?: ReactNode;
}

/**
 * Muestra su contenido solo si el usuario tiene el permiso. Ocultar no es seguridad:
 * el backend valida siempre (AGENTS.md regla 2).
 * @example <Puede permiso="miembros:crear"><Button>Nuevo miembro</Button></Puede>
 */
export function Puede({ permiso, children, sino = null }: PuedeProps) {
  const permitido = usePermiso(...[permiso].flat());
  return <>{permitido ? children : sino}</>;
}
