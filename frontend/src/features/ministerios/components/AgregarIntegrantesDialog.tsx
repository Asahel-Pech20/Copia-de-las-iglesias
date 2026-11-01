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
import { normalizarError } from '@/lib/api';
import { notificar } from '@/lib/notificar';
import type { Ministerio } from '@/types/ministerios';
import { useIntegrantes, useVincularMiembros } from '../hooks';

interface Props {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  ministerio: Ministerio;
}

/**
 * "Agregar integrantes" con SelectorMiembros múltiple, sin ofrecer a los actuales (F2-10).
 * Se monta al abrir (el estado empieza vacío cada vez).
 */
export function AgregarIntegrantesDialog({ abierto, alCambiarAbierto, ministerio }: Props) {
  const vincular = useVincularMiembros();
  const actuales = useIntegrantes(ministerio.id, { limit: 100 });
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    try {
      await vincular.mutateAsync({ id: ministerio.id, miembroIds: seleccion });
      notificar.exito(
        seleccion.length === 1
          ? 'Integrante agregado'
          : `${seleccion.length} integrantes agregados`,
      );
      alCambiarAbierto(false);
    } catch (e) {
      setError(normalizarError(e).message);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar integrantes</DialogTitle>
          <DialogDescription>
            Busca y selecciona los miembros activos que se unirán a {ministerio.nombre}.
          </DialogDescription>
        </DialogHeader>
        {error && <Alert variante="peligro">{error}</Alert>}
        <FormField label="Miembros">
          <SelectorMiembros
            modo="multiple"
            valor={seleccion}
            alCambiar={setSeleccion}
            excluirIds={(actuales.data?.data ?? []).map((i) => i.id)}
          />
        </FormField>
        <DialogFooter>
          <Button variante="contorno" onClick={() => alCambiarAbierto(false)}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={seleccion.length === 0 || vincular.isPending}>
            {vincular.isPending && <Loader2 className="animate-spin" aria-hidden />}
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
