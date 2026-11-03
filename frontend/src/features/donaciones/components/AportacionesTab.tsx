import type { ReactNode } from 'react';
import { endOfMonth, format, startOfMonth, startOfYear, subMonths } from 'date-fns';
import { Coins, Eye } from 'lucide-react';
import { DataTable } from '@/components/comunes/DataTable';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { DateRangePicker, FiltrosBar, type RangoFechas } from '@/components/comunes/Filtros';
import { Paginacion } from '@/components/comunes/Paginacion';
import { Puede } from '@/components/comunes/Puede';
import { Button } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/controles';
import { Label } from '@/components/ui/label';
import { SelectorMiembros } from '@/features/miembros/components/SelectorMiembros';
import { BotonExportar } from '@/features/reportes/components/BotonExportar';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { useFormatoMoneda } from '@/hooks/useFormatoMoneda';
import { ETIQUETAS_CONCEPTO, ETIQUETAS_METODO, formatearFecha, opcionesDe } from '@/lib/formato';
import type { Donacion, QueryDonaciones } from '@/types/donaciones';
import { useDonaciones } from '../hooks';
import { conceptoDe, nombreDonante } from '../formato';

const TODOS = 'todos';
const fechaApi = (d: Date) => format(d, 'yyyy-MM-dd');

interface AportacionesTabProps {
  alVer: (id: string) => void;
  alRegistrar: () => void;
}

/** Listado de aportaciones con filtros en la URL y total del filtro (F4-01). */
export function AportacionesTab({ alVer, alRegistrar }: AportacionesTabProps) {
  const [filtros, setFiltros] = useFiltrosURL({
    desde: '',
    hasta: '',
    concepto: TODOS,
    metodo: TODOS,
    miembroId: '',
    anonimas: false as boolean,
    anuladas: false as boolean,
    page: 1,
  });
  const moneda = useFormatoMoneda();

  // Sin rango en la URL, el mes en curso
  const hoy = new Date();
  const sinRango = !filtros.desde && !filtros.hasta;
  const rango: RangoFechas = sinRango
    ? { desde: fechaApi(startOfMonth(hoy)), hasta: fechaApi(hoy) }
    : { desde: filtros.desde || undefined, hasta: filtros.hasta || undefined };

  const query: QueryDonaciones = {
    desde: rango.desde,
    hasta: rango.hasta,
    concepto: filtros.concepto === TODOS ? undefined : (filtros.concepto as Donacion['concepto']),
    metodo: filtros.metodo === TODOS ? undefined : (filtros.metodo as Donacion['metodo']),
    miembroId: filtros.miembroId || undefined,
    anonima: filtros.anonimas ? true : undefined,
    incluirAnuladas: filtros.anuladas ? true : undefined,
    page: filtros.page,
    limit: 20,
  };
  const consulta = useDonaciones(query);

  const presets: { etiqueta: string; rango: RangoFechas }[] = [
    {
      etiqueta: 'Este mes',
      rango: { desde: fechaApi(startOfMonth(hoy)), hasta: fechaApi(hoy) },
    },
    {
      etiqueta: 'Mes anterior',
      rango: {
        desde: fechaApi(startOfMonth(subMonths(hoy, 1))),
        hasta: fechaApi(endOfMonth(subMonths(hoy, 1))),
      },
    },
    {
      etiqueta: 'Este año',
      rango: {
        desde: fechaApi(startOfYear(hoy)),
        hasta: fechaApi(hoy),
      },
    },
  ];

  const filtrosReporte = { desde: rango.desde, hasta: rango.hasta };
  const datos = consulta.data?.data ?? [];

  return (
    <>
      <Card className="mb-4 p-4">
        <p className="text-sm text-texto-suave">Total del filtro (sin anuladas)</p>
        {consulta.isPending ? (
          <p className="mt-1 text-2xl font-semibold text-texto-suave">…</p>
        ) : (
          <p className="mt-1 text-3xl font-semibold tabular-nums" aria-live="polite">
            {moneda(consulta.data?.meta.totalMonto)}
          </p>
        )}
        {consulta.data && (
          <p className="mt-1 text-xs text-texto-suave">
            {consulta.data.meta.total} {consulta.data.meta.total === 1 ? 'registro' : 'registros'}
          </p>
        )}
      </Card>

      <FiltrosBar className="items-end">
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            valor={rango}
            alCambiar={(r) => setFiltros({ desde: r.desde ?? '', hasta: r.hasta ?? '' })}
          />
          {presets.map((p) => (
            <Button
              key={p.etiqueta}
              variante="secundario"
              tamano="sm"
              onClick={() => setFiltros({ desde: p.rango.desde, hasta: p.rango.hasta })}
            >
              {p.etiqueta}
            </Button>
          ))}
        </div>
        <SelectEnum
          className="w-full sm:w-48"
          aria-label="Filtrar por concepto"
          opciones={[
            { valor: TODOS, etiqueta: 'Todos los conceptos' },
            ...opcionesDe(ETIQUETAS_CONCEPTO),
          ]}
          valor={filtros.concepto}
          alCambiar={(concepto) => setFiltros({ concepto })}
        />
        <SelectEnum
          className="w-full sm:w-48"
          aria-label="Filtrar por método"
          opciones={[
            { valor: TODOS, etiqueta: 'Todos los métodos' },
            ...opcionesDe(ETIQUETAS_METODO),
          ]}
          valor={filtros.metodo}
          alCambiar={(metodo) => setFiltros({ metodo })}
        />
        <div className="w-full sm:w-56">
          <SelectorMiembros
            incluirInactivos
            placeholder="Cualquier donante"
            valor={filtros.miembroId || null}
            alCambiar={(id) => setFiltros({ miembroId: id ?? '' })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="solo-anonimas"
            checked={filtros.anonimas}
            onCheckedChange={(v) => setFiltros({ anonimas: v === true })}
          />
          <Label htmlFor="solo-anonimas">Solo anónimas</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="incluir-anuladas"
            checked={filtros.anuladas}
            onCheckedChange={(v) => setFiltros({ anuladas: v === true })}
          />
          <Label htmlFor="incluir-anuladas">Incluir anuladas</Label>
        </div>
        <div className="flex flex-col items-start gap-1 sm:ml-auto sm:items-end">
          <BotonExportar tipo="ingresos" filtros={filtrosReporte} />
          <p className="text-xs text-texto-suave">Exporta todas las aportaciones del rango.</p>
        </div>
      </FiltrosBar>

      <Card>
        {consulta.isPending ? (
          <SkeletonTabla filas={6} columnas={5} />
        ) : consulta.isError ? (
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        ) : datos.length === 0 ? (
          <EmptyState
            icono={Coins}
            titulo="No hay aportaciones en este periodo"
            descripcion="Cambia los filtros o registra una nueva aportación."
            accion={
              <Puede permiso="donaciones:crear">
                <Button onClick={alRegistrar}>Registrar aportación</Button>
              </Puede>
            }
          />
        ) : (
          <>
            <DataTable<Donacion>
              etiqueta="Aportaciones"
              datos={datos}
              obtenerId={(d) => d.id}
              columnas={[
                {
                  clave: 'fecha',
                  encabezado: 'Fecha',
                  celda: (d) => <Tachable d={d}>{formatearFecha(d.fecha)}</Tachable>,
                },
                {
                  clave: 'donante',
                  encabezado: 'Donante',
                  celda: (d) => <Tachable d={d}>{nombreDonante(d)}</Tachable>,
                },
                {
                  clave: 'concepto',
                  encabezado: 'Concepto',
                  celda: (d) => <Tachable d={d}>{conceptoDe(d)}</Tachable>,
                },
                {
                  clave: 'metodo',
                  encabezado: 'Método',
                  celda: (d) => <Tachable d={d}>{ETIQUETAS_METODO[d.metodo]}</Tachable>,
                },
                {
                  clave: 'monto',
                  encabezado: 'Monto',
                  className: 'text-right tabular-nums',
                  celda: (d) => <Tachable d={d}>{moneda(d.monto)}</Tachable>,
                },
                {
                  clave: 'estado',
                  encabezado: 'Estado',
                  celda: (d) =>
                    d.anulada ? (
                      <Badge variante="peligro">Anulada</Badge>
                    ) : (
                      <Badge>Registrada</Badge>
                    ),
                },
              ]}
              acciones={(d) => (
                <Button
                  variante="fantasma"
                  tamano="icono"
                  aria-label={`Ver detalle de la aportación de ${nombreDonante(d)} del ${formatearFecha(d.fecha)}`}
                  onClick={() => alVer(d.id)}
                >
                  <Eye aria-hidden />
                </Button>
              )}
            />
            {consulta.data && (
              <Paginacion
                meta={consulta.data.meta}
                alCambiarPagina={(page) => setFiltros({ page })}
              />
            )}
          </>
        )}
      </Card>
    </>
  );
}

/** Las aportaciones anuladas se muestran tachadas (no suman en ningún total). */
function Tachable({ d, children }: { d: Donacion; children: ReactNode }) {
  return (
    <span className={d.anulada ? 'text-texto-suave line-through' : undefined}>{children}</span>
  );
}
