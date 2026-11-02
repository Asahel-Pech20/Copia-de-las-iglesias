import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { FormField } from '@/components/comunes/FormField';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectorMiembros } from '@/features/miembros/components/SelectorMiembros';
import { esErrorApi, normalizarError } from '@/lib/api';
import { notificar } from '@/lib/notificar';
import type { EventoDetalle } from '@/types/eventos';
import { useAsignarResponsables } from '../hooks';

const MAX_RESPONSABLES = 10;

interface ResponsablesDialogProps {
  evento: EventoDetalle;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}

/** Editar responsables con SelectorMiembros múltiple (máx. 10). Un 422 indica qué miembro no es válido (F3-04). */
export function ResponsablesDialog({ evento, abierto, alCambiarAbierto }: ResponsablesDialogProps) {
  const asignar = useAsignarResponsables();
  const [ids, setIds] = useState(() => evento.responsables.map((r) => r.id));
  const [error, setError] = useState<{ mensaje: string; detalles: string[] } | null>(null);
  const excedido = ids.length > MAX_RESPONSABLES;

  function cambiarAbierto(valor: boolean) {
    if (asignar.isPending) return;
    if (valor) setIds(evento.responsables.map((r) => r.id));
    setError(null);
    alCambiarAbierto(valor);
  }

  async function guardar() {
    setError(null);
    try {
      await asignar.mutateAsync({ id: evento.id, miembroIds: ids });
      notificar.exito('Responsables guardados');
      alCambiarAbierto(false);
    } catch (e) {
      setError({
        mensaje: normalizarError(e).message,
        detalles: esErrorApi(e) ? (e.details ?? []).map((d) => d.mensaje) : [],
      });
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={cambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Responsables del evento</DialogTitle>
          <DialogDescription>Hasta {MAX_RESPONSABLES} miembros activos.</DialogDescription>
        </DialogHeader>
        <FormField
          label="Responsables"
          error={excedido ? `Máximo ${MAX_RESPONSABLES} responsables.` : undefined}
          hint={`${ids.length} de ${MAX_RESPONSABLES} seleccionados`}
        >
          <SelectorMiembros modo="multiple" valor={ids} alCambiar={setIds} />
        </FormField>
        {error && (
          <Alert variante="peligro">
            {error.detalles.length > 0 ? (
              <ul className="list-disc pl-4">
                {error.detalles.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : (
              error.mensaje
            )}
          </Alert>
        )}
        <DialogFooter>
          <Button
            variante="contorno"
            onClick={() => cambiarAbierto(false)}
            disabled={asignar.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={excedido || asignar.isPending}>
            {asignar.isPending && <Loader2 className="animate-spin" aria-hidden />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
