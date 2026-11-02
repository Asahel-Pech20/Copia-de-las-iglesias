import { Check, History, X } from 'lucide-react';
import { Link } from 'react-router';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { type Columna, DataTable } from '@/components/comunes/DataTable';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { DateRangePicker, FiltrosBar } from '@/components/comunes/Filtros';
import { FormField } from '@/components/comunes/FormField';
import { Paginacion } from '@/components/comunes/Paginacion';
import { Badge, Card } from '@/components/ui/card';
import { useEventos } from '@/features/eventos/hooks';
import { SelectorMiembros } from '@/features/miembros/components/SelectorMiembros';
import { formatearFechaHora } from '@/lib/formato';
import type { AsistenciaHistorial, QueryAsistencias } from '@/types/asistencia';
import { useAsistencias } from '../hooks';

const TODOS = 'todos';

export interface FiltrosHistorial {
  desde: string;
  hasta: string;
  miembroId: string;
  eventoId: string;
  page: number;
}

interface HistorialAsistenciaProps {
  filtros: FiltrosHistorial;
  alCambiar: (cambios: Partial<FiltrosHistorial>) => void;
}

const COLUMNAS: Columna<AsistenciaHistorial>[] = [
  {
    clave: 'fecha',
    encabezado: 'Fecha',
    celda: (a) => formatearFechaHora(a.evento.fechaInicio),
  },
  {
    clave: 'evento',
    encabezado: 'Evento',
    celda: (a) => (
      <Link className="text-primario hover:underline" to={`/eventos/${a.evento.id}`}>
        {a.evento.titulo}
      </Link>
    ),
  },
  {
    clave: 'miembro',
    encabezado: 'Miembro',
    celda: (a) => (
      <Link className="hover:underline" to={`/miembros/${a.miembro.id}`}>
        {a.miembro.nombre} {a.miembro.apellidos}
      </Link>
    ),
  },
  {
    clave: 'presente',
    encabezado: 'Asistencia',
    celda: (a) =>
      a.presente ? (
        <Badge variante="exito">
          <Check aria-hidden /> Presente
        </Badge>
      ) : (
        <Badge variante="peligro">
          <X aria-hidden /> Ausente
        </Badge>
      ),
  },
  {
    clave: 'registradoPor',
    encabezado: 'Registró',
    celda: (a) => a.registradoPor.nombre,
    ocultarEnTarjeta: true,
  },
];

/**
 * Historial filtrable por rango, evento y miembro; los filtros viven en la URL (F3-08).
 * Para el perfil del miembro (F2-04) usar directamente `useAsistencias({ miembroId })`.
 */
export function HistorialAsistencia({ filtros, alCambiar }: HistorialAsistenciaProps) {
  const query: QueryAsistencias = {
    page: filtros.page,
    ...(filtros.desde && { desde: filtros.desde }),
    ...(filtros.hasta && { hasta: filtros.hasta }),
    ...(filtros.miembroId && { miembroId: filtros.miembroId }),
    ...(filtros.eventoId && { eventoId: filtros.eventoId }),
  };
  const consulta = useAsistencias(query);
  // Eventos recientes para el filtro por evento
  const { data: eventos } = useEventos({ limit: 50, orden: 'fechaInicio:desc' });
  const opcionesEvento = [
    { valor: TODOS, etiqueta: 'Todos los eventos' },
    ...(eventos?.data ?? [])
      .filter((e) => e.estado !== 'PROGRAMADO' || e.id === filtros.eventoId)
      .map((e) => ({
        valor: e.id,
        etiqueta: `${e.titulo} (${formatearFechaHora(e.fechaInicio)})`,
      })),
  ];

  return (
    <>
      <FiltrosBar>
        <DateRangePicker
          valor={{ desde: filtros.desde || undefined, hasta: filtros.hasta || undefined }}
          alCambiar={(r) => alCambiar({ desde: r.desde ?? '', hasta: r.hasta ?? '' })}
        />
        <SelectEnum
          aria-label="Evento"
          className="sm:w-72"
          opciones={opcionesEvento}
          valor={filtros.eventoId || TODOS}
          alCambiar={(v) => alCambiar({ eventoId: v === TODOS ? '' : v })}
        />
        <FormField label="Miembro" className="sm:w-72">
          <SelectorMiembros
            incluirInactivos
            valor={filtros.miembroId || null}
            alCambiar={(id) => alCambiar({ miembroId: id ?? '' })}
            placeholder="Todos los miembros"
          />
        </FormField>
      </FiltrosBar>
      <Card>
        {consulta.isPending ? (
          <SkeletonTabla filas={5} columnas={4} />
        ) : consulta.isError ? (
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        ) : consulta.data.data.length === 0 ? (
          <EmptyState icono={History} titulo="No hay asistencia registrada con estos filtros" />
        ) : (
          <>
            <DataTable
              etiqueta="Historial de asistencia"
              columnas={COLUMNAS}
              datos={consulta.data.data}
              obtenerId={(a) => a.id}
            />
            <Paginacion meta={consulta.data.meta} alCambiarPagina={(page) => alCambiar({ page })} />
          </>
        )}
      </Card>
    </>
  );
}
