import { Loader2, Network, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { EmptyState } from '@/components/comunes/Estados';
import { Button } from '@/components/ui/button';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useDesvincularMiembro,
  useMinisterios,
  usePuedeGestionarIntegrantes,
  useVincularMiembros,
} from '@/features/ministerios/hooks';
import { formatearFecha } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { MiembroDetalle, MinisterioDeMiembro } from '@/types/miembros';

/** Ministerios del miembro con opción de agregar/quitar según permisos (F2-04, F2-05). */
export function MinisteriosDelMiembro({ miembro }: { miembro: MiembroDetalle }) {
  const ministerios = useMinisterios();
  const puedeGestionar = usePuedeGestionarIntegrantes();
  const vincular = useVincularMiembros();
  const desvincular = useDesvincularMiembro();
  const [elegido, setElegido] = useState<string | undefined>();
  const [porQuitar, setPorQuitar] = useState<MinisterioDeMiembro | null>(null);

  const actuales = miembro.ministerios.filter((m) => m.activo);
  const historicos = miembro.ministerios.filter((m) => !m.activo);
  const catalogo = ministerios.data?.data ?? [];
  // COORDINADOR: solo ve como opción los ministerios que coordina
  const opciones = catalogo
    .filter((m) => puedeGestionar(m) && !actuales.some((a) => a.id === m.id))
    .map((m) => ({ valor: m.id, etiqueta: m.nombre }));
  const puedeQuitar = (id: string) => puedeGestionar(catalogo.find((m) => m.id === id));

  async function agregar() {
    if (!elegido) return;
    try {
      await vincular.mutateAsync({ id: elegido, miembroIds: [miembro.id] });
      notificar.exito('Miembro agregado al ministerio');
      setElegido(undefined);
    } catch (error) {
      notificar.error(error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ministerios</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {miembro.activo && opciones.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <SelectEnum
              opciones={opciones}
              valor={elegido}
              alCambiar={setElegido}
              placeholder="Elige un ministerio"
              className="sm:w-60"
              aria-label="Ministerio al que agregar"
            />
            <Button onClick={agregar} disabled={!elegido || vincular.isPending}>
              {vincular.isPending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Plus aria-hidden />
              )}
              Agregar a ministerio
            </Button>
          </div>
        )}

        {actuales.length === 0 ? (
          <EmptyState icono={Network} titulo="No pertenece a ningún ministerio" className="py-6" />
        ) : (
          <ul className="flex flex-col divide-y" aria-label="Ministerios actuales">
            {actuales.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <Link
                    to={`/ministerios/${m.id}`}
                    className="font-medium text-primario hover:underline"
                  >
                    {m.nombre}
                  </Link>
                  <p className="text-xs text-texto-suave">Desde {formatearFecha(m.fechaUnion)}</p>
                </div>
                {puedeQuitar(m.id) && (
                  <Button
                    variante="fantasma"
                    tamano="sm"
                    onClick={() => setPorQuitar(m)}
                    aria-label={`Quitar de ${m.nombre}`}
                  >
                    <X aria-hidden /> Quitar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {historicos.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-texto-suave">Anteriores</p>
            <ul className="flex flex-wrap gap-1.5" aria-label="Ministerios anteriores">
              {historicos.map((m) => (
                <li key={m.id}>
                  <Badge variante="neutro">
                    {m.nombre} ({formatearFecha(m.fechaUnion)} – {formatearFecha(m.fechaSalida)})
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        abierto={porQuitar !== null}
        alCambiarAbierto={(abierto) => !abierto && setPorQuitar(null)}
        titulo="Quitar del ministerio"
        descripcion={`${miembro.nombre} saldrá de ${porQuitar?.nombre}. Su participación quedará en el historial.`}
        textoConfirmar="Quitar"
        peligro
        alConfirmar={async () => {
          await desvincular.mutateAsync({ id: porQuitar!.id, miembroId: miembro.id });
          notificar.exito('Miembro quitado del ministerio');
        }}
      />
    </Card>
  );
}
