import { format } from 'date-fns';
import { FileText, Loader2, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { FiltrosBar } from '@/components/comunes/Filtros';
import { Puede } from '@/components/comunes/Puede';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDescargarReporte } from '@/features/reportes/hooks';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { useFormatoMoneda } from '@/hooks/useFormatoMoneda';
import { etiquetaClave, formatearMes } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { GrupoIngresos } from '@/types/donaciones';
import { textoVariacion } from '../formato';
import { useResumenMensual } from '../hooks';

/** Resumen mensual: total, variación contra el mes anterior y desgloses (F4-05). */
export function ResumenMensualTab() {
  const [filtros, setFiltros] = useFiltrosURL({ mes: '' });
  const moneda = useFormatoMoneda();
  const descargar = useDescargarReporte();

  const valorMes = filtros.mes || format(new Date(), 'yyyy-MM');
  const [anio, mes] = valorMes.split('-').map(Number) as [number, number];
  const consulta = useResumenMensual(anio, mes);
  const r = consulta.data;

  function descargarPdf() {
    if (!r) return;
    descargar.mutate(
      {
        tipo: 'ingresos',
        filtros: { desde: r.desde, hasta: r.hasta, agrupar: 'concepto' },
        formato: 'pdf',
      },
      { onSuccess: (a) => notificar.exito(`Descargado ${a.nombre}`), onError: notificar.error },
    );
  }

  return (
    <>
      <FiltrosBar className="items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mes-resumen">Mes</Label>
          <Input
            id="mes-resumen"
            type="month"
            className="w-full sm:w-48"
            value={valorMes}
            max={format(new Date(), 'yyyy-MM')}
            onChange={(e) => e.target.value && setFiltros({ mes: e.target.value })}
          />
        </div>
        <Puede permiso="reportes:ingresos">
          <Button
            variante="contorno"
            className="sm:ml-auto"
            onClick={descargarPdf}
            disabled={!r || descargar.isPending}
          >
            {descargar.isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <FileText aria-hidden />
            )}
            Descargar PDF
          </Button>
        </Puede>
      </FiltrosBar>

      {consulta.isPending ? (
        <Card>
          <SkeletonTabla filas={5} columnas={2} />
        </Card>
      ) : consulta.isError || !r ? (
        <Card>
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-texto-suave">Total de {formatearMes(r.anio, r.mes)}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{moneda(r.total)}</p>
                <p className="mt-1 text-xs text-texto-suave">
                  {r.cantidad} {r.cantidad === 1 ? 'aportación' : 'aportaciones'}
                </p>
              </div>
              <div>
                <p className="text-sm text-texto-suave">
                  Contra {formatearMes(r.mesAnterior.anio, r.mesAnterior.mes)}
                </p>
                <Variacion valor={r.variacionPorcentual} />
                <p className="mt-1 text-xs text-texto-suave">
                  Mes anterior: {moneda(r.mesAnterior.total)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-texto-suave">Aportaciones identificadas</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {moneda(r.identificadas.total)}
                </p>
                <p className="text-xs text-texto-suave">{r.identificadas.cantidad} registros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-texto-suave">Aportaciones anónimas</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {moneda(r.anonimas.total)}
                </p>
                <p className="text-xs text-texto-suave">{r.anonimas.cantidad} registros</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Desglose titulo="Por concepto" grupos={r.porConcepto} />
            <Desglose titulo="Por método de recepción" grupos={r.porMetodo} />
          </div>
        </div>
      )}
    </>
  );
}

function Variacion({ valor }: { valor: number | null }) {
  if (valor === null) {
    return <p className="mt-1 text-base text-texto-suave">Sin datos del mes anterior</p>;
  }
  const Icono = valor > 0 ? TrendingUp : valor < 0 ? TrendingDown : Minus;
  const color = valor > 0 ? 'text-exito' : valor < 0 ? 'text-peligro' : 'text-texto-suave';
  return (
    <p className={`mt-1 flex items-center gap-2 text-3xl font-semibold tabular-nums ${color}`}>
      <Icono className="size-6" aria-hidden />
      <span>{textoVariacion(valor)}</span>
      <span className="sr-only">
        {valor > 0 ? 'más' : valor < 0 ? 'menos' : 'igual'} que el mes anterior
      </span>
    </p>
  );
}

function Desglose({ titulo, grupos }: { titulo: string; grupos: GrupoIngresos[] }) {
  const moneda = useFormatoMoneda();
  const conDatos = grupos.filter((g) => g.cantidad > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        {conDatos.length === 0 ? (
          <p className="text-texto-suave">Sin aportaciones este mes.</p>
        ) : (
          <dl className="flex flex-col divide-y">
            {conDatos.map((g) => (
              <div key={g.clave} className="flex items-center justify-between gap-3 py-2">
                <dt>
                  {etiquetaClave(g.clave)}{' '}
                  <span className="text-xs text-texto-suave">({g.cantidad})</span>
                </dt>
                <dd className="tabular-nums">{moneda(g.total)}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
