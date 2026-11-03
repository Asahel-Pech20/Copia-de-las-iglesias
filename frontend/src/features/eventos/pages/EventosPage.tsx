import type { DatesSetArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Ban, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { ErrorState } from '@/components/comunes/Estados';
import { FiltrosBar } from '@/components/comunes/Filtros';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/controles';
import { Label } from '@/components/ui/label';
import { useMinisterios } from '@/features/ministerios/hooks';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { usePermiso } from '@/hooks/usePermiso';
import {
  aFechaApi,
  ETIQUETAS_CATEGORIA_EVENTO,
  ETIQUETAS_TIPO_EVENTO,
  opcionesDe,
} from '@/lib/formato';
import type { CategoriaEvento, Evento, TipoEvento } from '@/types/eventos';
import { LeyendaCategorias } from '../components/categorias';
import { cn } from '@/lib/utils';
import { ESTILO_CATEGORIA } from '../estilos';
import { useEventos } from '../hooks';
import './calendario.css';

const TODOS = 'todos';

/** En móvil (< 768 px) la vista por defecto es Lista (F3-01). */
function vistaInicial() {
  return window.matchMedia('(max-width: 767px)').matches ? 'listMonth' : 'dayGridMonth';
}

function ContenidoEvento({ event, view }: EventContentArg) {
  const evento = event.extendedProps.evento as Evento;
  const cancelado = evento.estado === 'CANCELADO';
  const Icono = cancelado ? Ban : ESTILO_CATEGORIA[evento.categoria].icono;
  // La vista Lista ya tiene su columna de hora y permite varias líneas (pantallas angostas)
  const enLista = view.type.startsWith('list');
  const hora =
    enLista || event.allDay
      ? ''
      : `${event.start?.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })} `;
  return (
    <span className={cn('flex min-w-0 items-center gap-1 px-1', enLista ? 'text-sm' : 'text-xs')}>
      <Icono className="size-3 shrink-0" aria-hidden />
      <span className={cn(enLista ? 'break-words' : 'truncate', cancelado && 'line-through')}>
        {hora}
        {evento.titulo}
      </span>
      {cancelado && <span className="sr-only">(cancelado)</span>}
    </span>
  );
}

/** /eventos: calendario mes / semana / lista con filtros en la URL (F3-01). */
export function EventosPage() {
  const navegar = useNavigate();
  const puedeCrear = usePermiso('eventos:crear', 'eventos:crear-propio');
  const { data: ministerios } = useMinisterios();
  const [filtros, setFiltros] = useFiltrosURL({
    tipo: TODOS,
    categoria: TODOS,
    ministerioId: TODOS,
    cancelados: true as boolean,
  });
  // Rango visible del calendario: se pide solo lo que se ve
  const [rango, setRango] = useState<{ desde: string; hasta: string } | null>(null);

  const consulta = useEventos(
    {
      desde: rango?.desde,
      hasta: rango?.hasta,
      ...(filtros.tipo !== TODOS && { tipo: filtros.tipo as TipoEvento }),
      ...(filtros.categoria !== TODOS && { categoria: filtros.categoria as CategoriaEvento }),
      ...(filtros.ministerioId !== TODOS && { ministerioId: filtros.ministerioId }),
    },
    { habilitado: rango !== null },
  );
  const eventos = (consulta.data?.data ?? []).filter(
    (e) => filtros.cancelados || e.estado !== 'CANCELADO',
  );

  const opcionesMinisterio = [
    { valor: TODOS, etiqueta: 'Todos los ministerios' },
    ...(ministerios?.data ?? []).map((m) => ({ valor: m.id, etiqueta: m.nombre })),
  ];

  return (
    <>
      <PageHeader
        titulo="Eventos"
        descripcion="Calendario de cultos, reuniones y actividades."
        acciones={
          puedeCrear && (
            <Button asChild>
              <Link to="/eventos/nuevo">
                <Plus aria-hidden /> Nuevo evento
              </Link>
            </Button>
          )
        }
      />
      <FiltrosBar>
        <SelectEnum
          aria-label="Tipo"
          className="sm:w-44"
          opciones={[
            { valor: TODOS, etiqueta: 'Todos los tipos' },
            ...opcionesDe(ETIQUETAS_TIPO_EVENTO),
          ]}
          valor={filtros.tipo}
          alCambiar={(tipo) => setFiltros({ tipo })}
        />
        <SelectEnum
          aria-label="Categoría"
          className="sm:w-52"
          opciones={[
            { valor: TODOS, etiqueta: 'Todas las categorías' },
            ...opcionesDe(ETIQUETAS_CATEGORIA_EVENTO),
          ]}
          valor={filtros.categoria}
          alCambiar={(categoria) => setFiltros({ categoria })}
        />
        <SelectEnum
          aria-label="Ministerio"
          className="sm:w-52"
          opciones={opcionesMinisterio}
          valor={filtros.ministerioId}
          alCambiar={(ministerioId) => setFiltros({ ministerioId })}
        />
        <div className="flex min-h-11 items-center gap-2">
          <Switch
            id="ver-cancelados"
            checked={filtros.cancelados}
            onCheckedChange={(cancelados) => setFiltros({ cancelados })}
          />
          <Label htmlFor="ver-cancelados">Mostrar cancelados</Label>
        </div>
      </FiltrosBar>

      <Card>
        <CardContent className="calendario-eventos flex flex-col gap-4 p-2 sm:p-4">
          <LeyendaCategorias />
          {consulta.isError && (
            <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
          )}
          <div aria-busy={consulta.isFetching}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              locale={esLocale}
              initialView={vistaInicial()}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listMonth',
              }}
              buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', list: 'Lista' }}
              height="auto"
              // Bloques con el color de la categoría (no solo un punto) en la vista de mes
              eventDisplay="block"
              dayMaxEvents={3}
              noEventsText="No hay eventos en este periodo"
              events={eventos.map((e) => {
                const cancelado = e.estado === 'CANCELADO';
                const estilo = ESTILO_CATEGORIA[e.categoria];
                return {
                  id: e.id,
                  title: e.titulo,
                  start: e.fechaInicio,
                  end: e.fechaFin ?? undefined,
                  backgroundColor: cancelado ? 'var(--superficie-suave)' : estilo.color,
                  borderColor: cancelado ? 'var(--borde)' : estilo.color,
                  textColor: cancelado ? 'var(--texto-suave)' : estilo.texto,
                  extendedProps: { evento: e },
                };
              })}
              eventContent={ContenidoEvento}
              eventClick={(info: EventClickArg) => {
                info.jsEvent.preventDefault();
                navegar(`/eventos/${info.event.id}`);
              }}
              dateClick={(info: DateClickArg) => {
                if (puedeCrear) navegar(`/eventos/nuevo?fecha=${aFechaApi(info.date)}`);
              }}
              datesSet={(info: DatesSetArg) =>
                setRango({ desde: info.start.toISOString(), hasta: info.end.toISOString() })
              }
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
