import { format, startOfYear } from 'date-fns';
import { ArrowLeft, Banknote, CalendarCheck, Network, Users, type LucideIcon } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { Link } from 'react-router';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { EmptyState } from '@/components/comunes/Estados';
import { DateRangePicker, FiltrosBar, type RangoFechas } from '@/components/comunes/Filtros';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSesion } from '@/features/auth/contexto';
import { useEventos } from '@/features/eventos/hooks';
import { useMinisterios } from '@/features/ministerios/hooks';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { ETIQUETAS_AGRUPACION, formatearFechaHora, opcionesDe } from '@/lib/formato';
import type { Permiso } from '@/types/comunes';
import type { AgrupacionIngresos } from '@/types/donaciones';
import type { FiltrosReporte, TipoReporte } from '@/types/reportes';
import { BotonExportar } from '../components/BotonExportar';
import { VistaPreviaReporte } from '../components/VistaPreviaReporte';
import { useReporte } from '../hooks';
import { permisosDeReporte } from '../permisos';

interface InfoReporte {
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
}

const REPORTES: InfoReporte[] = [
  {
    tipo: 'miembros',
    titulo: 'Miembros',
    descripcion: 'Listado general de la congregación con sus ministerios.',
    icono: Users,
  },
  {
    tipo: 'asistencia',
    titulo: 'Asistencia',
    descripcion: 'Por evento o resumen semanal y mensual de un periodo.',
    icono: CalendarCheck,
  },
  {
    tipo: 'ministerios',
    titulo: 'Ministerios',
    descripcion: 'Participación e integrantes de cada ministerio.',
    icono: Network,
  },
  {
    tipo: 'ingresos',
    titulo: 'Ingresos',
    descripcion: 'Aportaciones por periodo, concepto o método de recepción.',
    icono: Banknote,
  },
];

const esTipo = (valor: string): valor is TipoReporte => REPORTES.some((r) => r.tipo === valor);
const TODOS = 'todos';

/** /reportes: tarjetas por reporte (según permisos) y, con ?tipo=, filtros + vista previa + descarga. */
export function ReportesPage() {
  const [filtros] = useFiltrosURL({ tipo: '' });
  const { permisos } = useSesion();
  const permitidos = REPORTES.filter((r) =>
    permisosDeReporte(r.tipo).some((p: Permiso) => permisos.includes(p)),
  );
  const pedido = esTipo(filtros.tipo) ? REPORTES.find((r) => r.tipo === filtros.tipo) : undefined;

  if (pedido) {
    return permitidos.includes(pedido) ? (
      <DetalleReporte info={pedido} />
    ) : (
      <>
        <PageHeader titulo="Reportes" />
        <Card>
          <EmptyState
            titulo="No tienes acceso a este reporte"
            descripcion="Tu rol no incluye este reporte. Elige uno de los disponibles."
            accion={
              <Link to="/reportes" className="text-primario hover:underline">
                Ver mis reportes
              </Link>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Reportes"
        descripcion="Consulta un reporte en pantalla y descárgalo en PDF o Excel."
      />
      <ul aria-label="Reportes disponibles" className="grid gap-4 sm:grid-cols-2">
        {permitidos.map(({ tipo, titulo, descripcion, icono: Icono }) => (
          <li key={tipo}>
            <Link
              to={`/reportes?tipo=${tipo}`}
              className="block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anillo"
            >
              <Card className="h-full transition-colors hover:bg-superficie-suave">
                <CardHeader className="flex-row items-start gap-3">
                  <span className="rounded-lg bg-superficie-suave p-2 text-primario">
                    <Icono className="size-5" aria-hidden />
                  </span>
                  <div>
                    <CardTitle>{titulo}</CardTitle>
                    <CardDescription>{descripcion}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function DetalleReporte({ info }: { info: InfoReporte }) {
  const [url, setUrl] = useFiltrosURL({
    tipo: '',
    estado: 'activo',
    modo: '',
    eventoId: '',
    periodo: 'semanal',
    desde: '',
    hasta: '',
    ministerioId: '',
    agrupar: 'mes',
  });

  // Filtros efectivos: son exactamente los que usan la vista previa y la descarga (F4-10)
  const filtros = useMemo<FiltrosReporte>(() => {
    const rango = {
      desde: url.desde || undefined,
      hasta: url.hasta || undefined,
    };
    switch (info.tipo) {
      case 'miembros':
        return { estado: url.estado as FiltrosReporte['estado'] };
      case 'asistencia':
        return (url.modo || (url.eventoId ? 'evento' : 'periodo')) === 'evento'
          ? { eventoId: url.eventoId || undefined }
          : { periodo: url.periodo as FiltrosReporte['periodo'], ...rango };
      case 'ministerios':
        return { ministerioId: url.ministerioId || undefined, ...rango };
      case 'ingresos': {
        const sinRango = !url.desde && !url.hasta;
        return {
          agrupar: url.agrupar as AgrupacionIngresos,
          desde: sinRango ? format(startOfYear(new Date()), 'yyyy-MM-dd') : rango.desde,
          hasta: sinRango ? format(new Date(), 'yyyy-MM-dd') : rango.hasta,
        };
      }
    }
  }, [info.tipo, url]);

  // Asistencia por evento sin evento elegido: no hay nada que consultar todavía
  const falta = info.tipo === 'asistencia' && 'eventoId' in filtros && !filtros.eventoId;
  const consulta = useReporte(info.tipo, filtros, !falta);

  return (
    <>
      <PageHeader
        titulo={`Reporte de ${info.titulo.toLowerCase()}`}
        descripcion={info.descripcion}
        acciones={
          <>
            <Link
              to="/reportes"
              className="inline-flex items-center gap-1 text-sm text-primario hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden /> Todos los reportes
            </Link>
            <BotonExportar tipo={info.tipo} filtros={filtros} />
          </>
        }
      />
      <FiltrosBar className="items-end">
        <FiltrosDe tipo={info.tipo} url={url} filtros={filtros} cambiar={setUrl} />
      </FiltrosBar>
      {falta ? (
        <Card>
          <EmptyState
            titulo="Elige un evento"
            descripcion="Selecciona el evento del que quieres ver el pase de lista."
          />
        </Card>
      ) : (
        <VistaPreviaReporte
          reporte={consulta.data}
          cargando={consulta.isPending}
          error={consulta.isError ? consulta.error : undefined}
          alReintentar={() => consulta.refetch()}
        />
      )}
    </>
  );
}

type UrlFiltros = Record<
  'estado' | 'modo' | 'eventoId' | 'periodo' | 'desde' | 'hasta' | 'ministerioId' | 'agrupar',
  string
>;

interface FiltrosDeProps {
  tipo: TipoReporte;
  url: UrlFiltros;
  filtros: FiltrosReporte;
  cambiar: (cambios: Partial<UrlFiltros>) => void;
}

function FiltrosDe({ tipo, url, filtros, cambiar }: FiltrosDeProps) {
  const rango: RangoFechas = { desde: filtros.desde, hasta: filtros.hasta };
  const selectorRango = (
    <DateRangePicker
      valor={rango}
      alCambiar={(r) => cambiar({ desde: r.desde ?? '', hasta: r.hasta ?? '' })}
    />
  );

  switch (tipo) {
    case 'miembros':
      return (
        <SelectEnum
          className="w-full sm:w-48"
          aria-label="Estado de los miembros"
          opciones={[
            { valor: 'activo', etiqueta: 'Activos' },
            { valor: 'inactivo', etiqueta: 'Inactivos' },
            { valor: 'todos', etiqueta: 'Todos' },
          ]}
          valor={url.estado}
          alCambiar={(estado) => cambiar({ estado })}
        />
      );
    case 'asistencia':
      return <FiltrosAsistencia url={url} cambiar={cambiar} selectorRango={selectorRango} />;
    case 'ministerios':
      return <FiltrosMinisterios url={url} cambiar={cambiar} selectorRango={selectorRango} />;
    case 'ingresos':
      return (
        <>
          {selectorRango}
          <SelectEnum
            className="w-full sm:w-44"
            aria-label="Agrupar por"
            opciones={opcionesDe(ETIQUETAS_AGRUPACION)}
            valor={url.agrupar as AgrupacionIngresos}
            alCambiar={(agrupar) => cambiar({ agrupar })}
          />
        </>
      );
  }
}

interface FiltrosParcialesProps {
  url: UrlFiltros;
  cambiar: (cambios: Partial<UrlFiltros>) => void;
  selectorRango: ReactNode;
}

function FiltrosAsistencia({ url, cambiar, selectorRango }: FiltrosParcialesProps) {
  const modo = url.modo || (url.eventoId ? 'evento' : 'periodo');
  const { data: eventos } = useEventos({ limit: 100 });
  return (
    <>
      <SelectEnum
        className="w-full sm:w-44"
        aria-label="Tipo de reporte de asistencia"
        opciones={[
          { valor: 'periodo', etiqueta: 'Por periodo' },
          { valor: 'evento', etiqueta: 'Por evento' },
        ]}
        valor={modo as 'periodo' | 'evento'}
        alCambiar={(valor) => cambiar({ modo: valor })}
      />
      {modo === 'evento' ? (
        <SelectEnum
          className="w-full sm:w-80"
          aria-label="Evento"
          placeholder="Elige un evento…"
          opciones={(eventos?.data ?? []).map((e) => ({
            valor: e.id,
            etiqueta: `${e.titulo} (${formatearFechaHora(e.fechaInicio)})`,
          }))}
          valor={url.eventoId || undefined}
          alCambiar={(eventoId) => cambiar({ eventoId })}
        />
      ) : (
        <>
          {selectorRango}
          <SelectEnum
            className="w-full sm:w-40"
            aria-label="Periodo"
            opciones={[
              { valor: 'semanal', etiqueta: 'Semanal' },
              { valor: 'mensual', etiqueta: 'Mensual' },
            ]}
            valor={url.periodo as 'semanal' | 'mensual'}
            alCambiar={(periodo) => cambiar({ periodo })}
          />
        </>
      )}
    </>
  );
}

function FiltrosMinisterios({ url, cambiar, selectorRango }: FiltrosParcialesProps) {
  const { data: ministerios } = useMinisterios();
  return (
    <>
      <SelectEnum
        className="w-full sm:w-56"
        aria-label="Ministerio"
        opciones={[
          { valor: TODOS, etiqueta: 'Todos los ministerios' },
          ...(ministerios?.data ?? []).map((m) => ({ valor: m.id, etiqueta: m.nombre })),
        ]}
        valor={url.ministerioId || TODOS}
        alCambiar={(valor) => cambiar({ ministerioId: valor === TODOS ? '' : valor })}
      />
      {selectorRango}
    </>
  );
}
