import { FileSearch } from 'lucide-react';
import { DataTable } from '@/components/comunes/DataTable';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormatoMoneda } from '@/hooks/useFormatoMoneda';
import type { Celda, Reporte, SeccionReporte, TipoColumna } from '@/types/reportes';
import { formatearCelda, MAX_FILAS_VISTA } from '../formatoCelda';

type FilaVista = Record<string, Celda> & { __id: string };

interface VistaPreviaReporteProps {
  reporte: Reporte | undefined;
  cargando?: boolean;
  error?: unknown;
  alReintentar?: () => void;
}

/**
 * Vista previa genérica de cualquier `Reporte` (los cuatro tienen el mismo formato): filtros
 * aplicados, cifras clave y una tabla por sección con su fila de totales (F4-10).
 */
export function VistaPreviaReporte({
  reporte,
  cargando,
  error,
  alReintentar,
}: VistaPreviaReporteProps) {
  if (cargando) {
    return (
      <Card>
        <SkeletonTabla filas={6} columnas={4} />
      </Card>
    );
  }
  if (error || !reporte) {
    return (
      <Card>
        <ErrorState error={error} alReintentar={alReintentar} />
      </Card>
    );
  }
  return (
    <div
      className="flex flex-col gap-4"
      aria-label={`Vista previa: ${reporte.titulo}`}
      role="region"
    >
      <ResumenReporte reporte={reporte} />
      {reporte.secciones.map((seccion) => (
        <TablaSeccion key={seccion.titulo} seccion={seccion} />
      ))}
    </div>
  );
}

function ResumenReporte({ reporte }: { reporte: Reporte }) {
  const moneda = useFormatoMoneda();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{reporte.titulo}</CardTitle>
        {reporte.subtitulo && <p className="text-sm text-texto-suave">{reporte.subtitulo}</p>}
        {reporte.filtros.length > 0 && (
          <p className="text-sm text-texto-suave">
            {reporte.filtros
              .map((f) => `${f.etiqueta}: ${formatearCelda(f.valor, f.tipo, moneda)}`)
              .join(' · ')}
          </p>
        )}
      </CardHeader>
      {reporte.resumen.length > 0 && (
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {reporte.resumen.map((d) => (
              <div key={d.etiqueta} className="rounded-lg bg-superficie-suave p-3">
                <dt className="text-xs text-texto-suave">{d.etiqueta}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">
                  {formatearCelda(d.valor, d.tipo, moneda)}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      )}
    </Card>
  );
}

function TablaSeccion({ seccion }: { seccion: SeccionReporte }) {
  const moneda = useFormatoMoneda();
  const filas: FilaVista[] = seccion.filas
    .slice(0, MAX_FILAS_VISTA)
    .map((f, i) => ({ ...f, __id: String(i) }));
  const alineadas = (tipo?: TipoColumna) =>
    tipo && tipo !== 'texto' && tipo !== 'fecha' && tipo !== 'fechaHora'
      ? 'text-right tabular-nums'
      : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{seccion.titulo}</CardTitle>
      </CardHeader>
      {filas.length === 0 ? (
        <EmptyState icono={FileSearch} titulo="Sin datos para estos filtros" />
      ) : (
        <>
          <DataTable<FilaVista>
            etiqueta={seccion.titulo}
            datos={filas}
            obtenerId={(f) => f.__id}
            columnas={seccion.columnas.map((c) => ({
              clave: c.clave,
              encabezado: c.titulo,
              className: alineadas(c.tipo),
              celda: (f) => formatearCelda(f[c.clave], c.tipo, moneda),
            }))}
          />
          {seccion.filas.length > MAX_FILAS_VISTA && (
            <p className="border-t px-4 py-3 text-sm text-texto-suave">
              Mostrando las primeras {MAX_FILAS_VISTA} de{' '}
              {seccion.filas.length.toLocaleString('es-MX')} filas. Descarga el archivo para verlas
              todas.
            </p>
          )}
          {seccion.totales && (
            <dl
              aria-label={`Totales de ${seccion.titulo}`}
              className="flex flex-wrap gap-x-6 gap-y-1 border-t bg-superficie-suave px-4 py-3 text-sm font-semibold"
            >
              {seccion.columnas
                .filter(
                  (c) =>
                    seccion.totales![c.clave] !== undefined && seccion.totales![c.clave] !== null,
                )
                .map((c) => (
                  <div key={c.clave} className="flex gap-2">
                    <dt className="font-normal text-texto-suave">{c.titulo}:</dt>
                    <dd className="tabular-nums">
                      {formatearCelda(seccion.totales![c.clave], c.tipo, moneda)}
                    </dd>
                  </div>
                ))}
            </dl>
          )}
        </>
      )}
    </Card>
  );
}
