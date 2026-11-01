import type { ComponentProps } from 'react';
import { Badge } from '@/components/ui/card';

type Variante = NonNullable<ComponentProps<typeof Badge>['variante']>;

interface BadgeEstadoProps {
  /** Atajo para entidades con soft delete: true = "Activo", false = "Inactivo" */
  activo?: boolean;
  /** Etiqueta libre (p. ej. "Cancelado"); tiene prioridad sobre `activo` */
  etiqueta?: string;
  variante?: Variante;
}

/**
 * Badge de estado.
 * @example <BadgeEstado activo={miembro.activo} />
 * @example <BadgeEstado etiqueta="Cancelado" variante="peligro" />
 */
export function BadgeEstado({ activo, etiqueta, variante }: BadgeEstadoProps) {
  const texto = etiqueta ?? (activo ? 'Activo' : 'Inactivo');
  const v: Variante = variante ?? (activo ? 'exito' : 'neutro');
  return <Badge variante={v}>{texto}</Badge>;
}
