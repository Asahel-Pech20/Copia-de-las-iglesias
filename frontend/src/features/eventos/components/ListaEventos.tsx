import { CalendarX2, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { formatearFechaHora } from '@/lib/formato';
import { cn } from '@/lib/utils';
import type { Evento } from '@/types/eventos';
import { ESTILO_CATEGORIA } from '../estilos';
import { BadgeEstadoEvento } from './categorias';

interface ListaEventosProps {
  eventos: Evento[] | undefined;
  cargando?: boolean;
  error?: unknown;
  alReintentar?: () => void;
  /** Texto del estado vacío */
  vacio?: string;
  /** Muestra el badge de estado (Programado / Realizado / Cancelado) */
  conEstado?: boolean;
  etiqueta?: string;
  className?: string;
}

/**
 * Lista compacta de eventos (enlace al detalle). La usan el dashboard (F4), las actividades del
 * ministerio (F2-11) y la pantalla de asistencia.
 * @example const { data, isPending } = useEventosProximos(5);
 *          <ListaEventos eventos={data} cargando={isPending} />
 */
export function ListaEventos({
  eventos,
  cargando,
  error,
  alReintentar,
  vacio = 'No hay eventos.',
  conEstado = false,
  etiqueta = 'Eventos',
  className,
}: ListaEventosProps) {
  if (cargando) return <SkeletonTabla filas={3} columnas={2} />;
  if (error) return <ErrorState error={error} alReintentar={alReintentar} />;
  if (!eventos?.length) return <EmptyState icono={CalendarX2} titulo={vacio} />;
  return (
    <ul aria-label={etiqueta} className={cn('flex flex-col divide-y', className)}>
      {eventos.map((e) => {
        const { clase, icono: Icono } = ESTILO_CATEGORIA[e.categoria];
        const cancelado = e.estado === 'CANCELADO';
        return (
          <li key={e.id} className="flex items-start gap-3 py-3">
            <span
              className={cn(
                'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
                cancelado ? 'bg-superficie-suave text-texto-suave' : clase,
              )}
            >
              <Icono className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <Link
                to={`/eventos/${e.id}`}
                className={cn('font-medium hover:underline', cancelado && 'line-through')}
              >
                {e.titulo}
              </Link>
              <p className="text-sm text-texto-suave">
                {formatearFechaHora(e.fechaInicio)}
                {e.ministerio && ` · ${e.ministerio.nombre}`}
              </p>
              <p className="flex items-center gap-1 text-sm text-texto-suave">
                <MapPin className="size-3.5" aria-hidden /> {e.lugar}
              </p>
            </div>
            {conEstado && <BadgeEstadoEvento estado={e.estado} />}
          </li>
        );
      })}
    </ul>
  );
}
