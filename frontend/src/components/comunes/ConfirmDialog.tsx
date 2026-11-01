import { Loader2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
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
import { Textarea } from '@/components/ui/input';
import { normalizarError } from '@/lib/api';
import { FormField } from './FormField';

interface ConfirmDialogProps {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  titulo: string;
  descripcion?: ReactNode;
  /** Texto del botón de confirmar (por defecto "Confirmar") */
  textoConfirmar?: string;
  /** Botón rojo para acciones destructivas */
  peligro?: boolean;
  /** Pide un motivo: "opcional" u "obligatorio" (no deja confirmar si está vacío) */
  motivo?: 'no' | 'opcional' | 'obligatorio';
  /**
   * Recibe el motivo (o undefined). Si devuelve una promesa, muestra "procesando" hasta que termine;
   * si la promesa falla (p. ej. 422), el diálogo sigue abierto y muestra el mensaje del servidor.
   */
  alConfirmar: (motivo?: string) => void | Promise<void>;
}

/**
 * Confirmación para acciones destructivas o irreversibles (desactivar, cancelar, anular, eliminar).
 * @example
 * <ConfirmDialog abierto={abierto} alCambiarAbierto={setAbierto} titulo="Anular donación"
 *   peligro motivo="obligatorio" alConfirmar={(motivo) => anular.mutateAsync({ id, motivo })} />
 */
export function ConfirmDialog({
  abierto,
  alCambiarAbierto,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  peligro,
  motivo = 'no',
  alConfirmar,
}: ConfirmDialogProps) {
  const [texto, setTexto] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const faltaMotivo = motivo === 'obligatorio' && texto.trim() === '';

  function cambiarAbierto(valor: boolean) {
    if (procesando) return;
    if (!valor) {
      setTexto('');
      setErrorServidor(null);
    }
    alCambiarAbierto(valor);
  }

  async function confirmar() {
    if (faltaMotivo) return;
    setProcesando(true);
    setErrorServidor(null);
    try {
      await alConfirmar(motivo === 'no' ? undefined : texto.trim() || undefined);
      setTexto('');
      alCambiarAbierto(false);
    } catch (error) {
      setErrorServidor(normalizarError(error).message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={cambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion && <DialogDescription>{descripcion}</DialogDescription>}
        </DialogHeader>
        {motivo !== 'no' && (
          <FormField label="Motivo" requerido={motivo === 'obligatorio'}>
            <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} />
          </FormField>
        )}
        {errorServidor && <Alert variante="peligro">{errorServidor}</Alert>}
        <DialogFooter>
          <Button variante="contorno" onClick={() => cambiarAbierto(false)} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            variante={peligro ? 'peligro' : 'primario'}
            onClick={confirmar}
            disabled={faltaMotivo || procesando}
          >
            {procesando && <Loader2 className="animate-spin" aria-hidden />}
            {textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
