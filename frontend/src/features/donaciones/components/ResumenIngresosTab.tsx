import { format, startOfYear } from 'date-fns';
import { LineChart } from 'lucide-react';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { DateRangePicker, FiltrosBar, type RangoFechas } from '@/components/comunes/Filtros';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  GraficaBarras,
  GraficaDona,
  type PuntoGrafica,
  TarjetaGrafica,
} from '@/features/dashboard/components/Graficas';
import { BotonExportar } from '@/features/reportes/components/BotonExportar';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { useFormatoMoneda } from '@/hooks/useFormatoMoneda';
import { ETIQUETAS_AGRUPACION, etiquetaClave, opcionesDe } from '@/lib/formato';
import type { AgrupacionIngresos } from '@/types/donaciones';
import { useResumenIngresos } from '../hooks';

/** Resumen de ingresos por periodo, concepto o método con gráfica y tabla (F4-04). */
export function ResumenIngresosTab() {
  // Claves propias (r…) para no mezclarse con los filtros del listado
  const [filtros, setFiltros] = useFiltrosURL({ rdesde: '', rhasta: '', agrupar: 'mes' });
  const moneda = useFormatoMoneda();

  const hoy = new Date();
  const sinRango = !filtros.rdesde && !filtros.rhasta;
  const rango: RangoFechas = sinRango
    ? { desde: format(startOfYear(hoy), 'yyyy-MM-dd'), hasta: format(hoy, 'yyyy-MM-dd') }
    : { desde: filtros.rdesde || undefined, hasta: filtros.rhasta || undefined };
  const agrupar = filtros.agrupar as AgrupacionIngresos;

  const consulta = useResumenIngresos({ desde: rango.desde, hasta: rango.hasta, agrupar });
  const resumen = consulta.data;
  const porCategoria = agrupar === 'concepto' || agrupar === 'metodo';

  // Solo para dibujar: los totales que se muestran en texto son los strings del backend
  const puntos: PuntoGrafica[] = (resumen?.grupos ?? [])
    .filter((g) => !porCategoria || g.cantidad > 0)
    .map((g) => ({ etiqueta: etiquetaClave(g.clave), valor: Number(g.total) }));

  return (
    <>
      <FiltrosBar className="items-end">
        <DateRangePicker
          valor={rango}
          alCambiar={(r) => setFiltros({ rdesde: r.desde ?? '', rhasta: r.hasta ?? '' })}
        />
        <SelectEnum
          className="w-full sm:w-44"
          aria-label="Agrupar por"
          opciones={opcionesDe(ETIQUETAS_AGRUPACION)}
          valor={agrupar}
          alCambiar={(valor) => setFiltros({ agrupar: valor })}
        />
        <div className="sm:ml-auto">
          <BotonExportar
            tipo="ingresos"
            filtros={{ desde: rango.desde, hasta: rango.hasta, agrupar }}
          />
        </div>
      </FiltrosBar>

      {consulta.isPending ? (
        <Card>
          <SkeletonTabla filas={6} columnas={3} />
        </Card>
      ) : consulta.isError ? (
        <Card>
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        </Card>
      ) : !resumen || resumen.cantidad === 0 ? (
        <Card>
          <EmptyState
            icono={LineChart}
            titulo="Sin ingresos en este periodo"
            descripcion="Prueba con otro rango de fechas."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <TarjetaGrafica
            titulo={`Ingresos por ${ETIQUETAS_AGRUPACION[agrupar].toLowerCase()}`}
            descripcion={`Total de ${moneda(resumen.total)} en ${resumen.cantidad} aportaciones.`}
            tabla={{
              encabezados: [ETIQUETAS_AGRUPACION[agrupar], 'Total'],
              filas: resumen.grupos.map((g) => [etiquetaClave(g.clave), moneda(g.total)]),
            }}
          >
            {porCategoria ? (
              <GraficaDona datos={puntos} formatoValor={moneda} />
            ) : (
              <GraficaBarras datos={puntos} formatoValor={moneda} nombre="Ingresos" />
            )}
          </TarjetaGrafica>

          <Card>
            <Table aria-label="Resumen de ingresos">
              <TableHeader>
                <TableRow>
                  <TableHead>{ETIQUETAS_AGRUPACION[agrupar]}</TableHead>
                  <TableHead className="text-right">Aportaciones</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumen.grupos.map((g) => (
                  <TableRow key={g.clave}>
                    <TableCell>{etiquetaClave(g.clave)}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.cantidad}</TableCell>
                    <TableCell className="text-right tabular-nums">{moneda(g.total)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {resumen.cantidad}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {moneda(resumen.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </>
  );
}
