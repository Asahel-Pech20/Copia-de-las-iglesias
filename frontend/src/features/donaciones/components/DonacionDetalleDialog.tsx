import { Ban, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { Puede } from '@/components/comunes/Puede';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConfiguracion } from '@/features/configuracion/hooks';
import {
  ETIQUETAS_METODO,
  formatearFecha,
  formatearFechaHora,
  formatearMoneda,
} from '@/lib/formato';
import type { Donacion } from '@/types/donaciones';
import { useDonacion } from '../hooks';
import { conceptoDe, nombreDonante } from '../formato';

interface DonacionDetalleDialogProps {
  /** Id de la aportación abierta, o null si está cerrado */
  id: string | null;
  alCerrar: () => void;
  alEditar: (donacion: Donacion) => void;
  alAnular: (donacion: Donacion) => void;
}

/** Detalle de una aportación con su auditoría; Editar y Anular solo si no está anulada (F4-03). */
export function DonacionDetalleDialog({
  id,
  alCerrar,
  alEditar,
  alAnular,
}: DonacionDetalleDialogProps) {
  const consulta = useDonacion(id ?? undefined);
  const { data: config } = useConfiguracion();
  const d = consulta.data;

  return (
    <Dialog open={id !== null} onOpenChange={(abierto) => !abierto && alCerrar()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalle de la aportación</DialogTitle>
          <DialogDescription>Datos y auditoría del registro.</DialogDescription>
        </DialogHeader>
        {consulta.isPending ? (
          <SkeletonTabla filas={5} columnas={2} />
        ) : consulta.isError || !d ? (
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`text-2xl font-semibold tabular-nums ${d.anulada ? 'line-through' : ''}`}
              >
                {formatearMoneda(d.monto, config?.moneda)}
              </p>
              {d.anulada && <Badge variante="peligro">Anulada</Badge>}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <Fila titulo="Fecha">{formatearFecha(d.fecha)}</Fila>
              <Fila titulo="Donante">
                {d.miembro ? (
                  <Link to={`/miembros/${d.miembro.id}`} className="text-primario hover:underline">
                    {nombreDonante(d)}
                  </Link>
                ) : (
                  'Anónimo'
                )}
              </Fila>
              <Fila titulo="Concepto">{conceptoDe(d)}</Fila>
              <Fila titulo="Método">{ETIQUETAS_METODO[d.metodo]}</Fila>
              <Fila titulo="Referencia">{d.referencia ?? '—'}</Fila>
              <Fila titulo="Notas">{d.notas ?? '—'}</Fila>
            </dl>

            <section aria-labelledby="auditoria" className="rounded-lg border p-3">
              <h3 id="auditoria" className="mb-2 text-sm font-semibold">
                Auditoría
              </h3>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <Fila titulo="Registrada por">
                  {d.registradoPor.nombre} · {formatearFechaHora(d.createdAt)}
                </Fila>
                {d.actualizadoPor && !d.anulada && (
                  <Fila titulo="Editada por">
                    {d.actualizadoPor.nombre} · {formatearFechaHora(d.updatedAt)}
                  </Fila>
                )}
                {d.anulada && (
                  <>
                    <Fila titulo="Anulada por">
                      {d.actualizadoPor?.nombre ?? '—'} · {formatearFechaHora(d.anuladaEn)}
                    </Fila>
                    <Fila titulo="Motivo">{d.motivoAnulacion ?? '—'}</Fila>
                  </>
                )}
              </dl>
            </section>

            {!d.anulada && (
              <DialogFooter>
                <Puede permiso="donaciones:eliminar">
                  <Button variante="contorno" onClick={() => alAnular(d)}>
                    <Ban aria-hidden /> Anular
                  </Button>
                </Puede>
                <Puede permiso="donaciones:editar">
                  <Button onClick={() => alEditar(d)}>
                    <Pencil aria-hidden /> Editar
                  </Button>
                </Puede>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Fila({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-texto-suave">{titulo}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}
