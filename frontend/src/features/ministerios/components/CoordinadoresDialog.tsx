import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/controles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useOpcionesUsuario } from '@/features/usuarios/hooks';
import { normalizarError } from '@/lib/api';
import { ETIQUETAS_ROL } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { Ministerio } from '@/types/ministerios';
import { useAsignarCoordinadores } from '../hooks';

interface Props {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  ministerio: Ministerio;
}

/**
 * Selección múltiple de usuarios activos COORDINADOR o PASTOR (F2-09). Reemplaza la lista.
 * Se monta al abrir, con los coordinadores actuales marcados.
 */
export function CoordinadoresDialog({ abierto, alCambiarAbierto, ministerio }: Props) {
  // GET /usuarios/opciones (B1) acepta un solo rol: se piden todos y se filtran aquí
  const opciones = useOpcionesUsuario();
  const asignar = useAsignarCoordinadores();
  const [seleccion, setSeleccion] = useState(() => ministerio.coordinadores.map((c) => c.id));
  const [error, setError] = useState<string | null>(null);

  const candidatos = (opciones.data ?? []).filter(
    (u) => u.rol === 'COORDINADOR' || u.rol === 'PASTOR',
  );

  function alternar(id: string) {
    setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function guardar() {
    setError(null);
    try {
      await asignar.mutateAsync({ id: ministerio.id, usuarioIds: seleccion });
      notificar.exito('Coordinadores actualizados');
      alCambiarAbierto(false);
    } catch (e) {
      setError(normalizarError(e).message);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Coordinadores de {ministerio.nombre}</DialogTitle>
          <DialogDescription>
            Solo usuarios activos con rol Coordinador o Pastor. Podrán gestionar los integrantes y
            las actividades de este ministerio.
          </DialogDescription>
        </DialogHeader>
        {error && <Alert variante="peligro">{error}</Alert>}
        {opciones.isPending ? (
          <p className="flex items-center gap-2 text-texto-suave">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando usuarios…
          </p>
        ) : opciones.isError ? (
          <Alert variante="peligro">{normalizarError(opciones.error).message}</Alert>
        ) : candidatos.length === 0 ? (
          <p className="text-texto-suave">No hay usuarios activos con rol Coordinador o Pastor.</p>
        ) : (
          <fieldset className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            <legend className="sr-only">Usuarios disponibles</legend>
            {candidatos.map((u) => {
              const idCampo = `coord-${u.id}`;
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-superficie-suave"
                >
                  <Checkbox
                    id={idCampo}
                    checked={seleccion.includes(u.id)}
                    onCheckedChange={() => alternar(u.id)}
                  />
                  <Label htmlFor={idCampo} className="flex-1 cursor-pointer font-normal">
                    {u.nombre}
                    <span className="ml-2 text-xs text-texto-suave">{ETIQUETAS_ROL[u.rol]}</span>
                  </Label>
                </div>
              );
            })}
          </fieldset>
        )}
        <DialogFooter>
          <Button variante="contorno" onClick={() => alCambiarAbierto(false)}>
            Cancelar
          </Button>
          <Button onClick={guardar} disabled={asignar.isPending || opciones.isPending}>
            {asignar.isPending && <Loader2 className="animate-spin" aria-hidden />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
