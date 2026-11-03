import { Ban } from 'lucide-react';
import { BadgeEstado } from '@/components/comunes/BadgeEstado';
import { ETIQUETAS_CATEGORIA_EVENTO, ETIQUETAS_ESTADO_EVENTO } from '@/lib/formato';
import { cn } from '@/lib/utils';
import type { CategoriaEvento, EstadoEvento } from '@/types/eventos';
import { ESTILO_CATEGORIA } from '../estilos';

/** Leyenda del calendario: color + ícono + texto de cada categoría y de "Cancelado". */
export function LeyendaCategorias({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Leyenda de categorías"
      className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-sm', className)}
    >
      {(Object.keys(ESTILO_CATEGORIA) as CategoriaEvento[]).map((categoria) => {
        const { clase, icono: Icono } = ESTILO_CATEGORIA[categoria];
        return (
          <li key={categoria} className="flex items-center gap-1.5">
            <span className={cn('inline-flex size-5 items-center justify-center rounded', clase)}>
              <Icono className="size-3.5" aria-hidden />
            </span>
            {ETIQUETAS_CATEGORIA_EVENTO[categoria]}
          </li>
        );
      })}
      <li className="flex items-center gap-1.5">
        <span className="inline-flex size-5 items-center justify-center rounded bg-superficie-suave text-texto-suave">
          <Ban className="size-3.5" aria-hidden />
        </span>
        <span className="line-through">Cancelado</span>
      </li>
    </ul>
  );
}

const VARIANTE_ESTADO = {
  PROGRAMADO: 'primario',
  REALIZADO: 'exito',
  CANCELADO: 'peligro',
} as const;

export function BadgeEstadoEvento({ estado }: { estado: EstadoEvento }) {
  return (
    <BadgeEstado etiqueta={ETIQUETAS_ESTADO_EVENTO[estado]} variante={VARIANTE_ESTADO[estado]} />
  );
}
