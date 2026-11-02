import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Input, Textarea } from '@/components/ui/input';
import { errorDeCampo, normalizarError } from '@/lib/api';
import { notificar } from '@/lib/notificar';
import type { Ministerio } from '@/types/ministerios';
import { useGuardarMinisterio } from '../hooks';
import { type DatosMinisterio, esquemaMinisterio, type FormMinisterio } from '../schemas';

interface Props {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  /** Ministerio a editar; sin él, crea uno nuevo */
  ministerio?: Ministerio | null;
}

/** Modal crear/editar ministerio (F2-08). El 409 por nombre duplicado se muestra en el campo. */
export function MinisterioFormDialog({ abierto, alCambiarAbierto, ministerio }: Props) {
  const guardar = useGuardarMinisterio();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormMinisterio, unknown, DatosMinisterio>({
    resolver: zodResolver(esquemaMinisterio),
  });

  useEffect(() => {
    if (abierto) {
      reset({ nombre: ministerio?.nombre ?? '', descripcion: ministerio?.descripcion ?? '' });
    }
  }, [abierto, ministerio, reset]);

  function cambiarAbierto(valor: boolean) {
    if (!valor) setErrorServidor(null);
    alCambiarAbierto(valor);
  }

  const enviar = handleSubmit(async (datos) => {
    setErrorServidor(null);
    try {
      await guardar.mutateAsync({ id: ministerio?.id, datos });
      notificar.exito(ministerio ? 'Ministerio actualizado' : 'Ministerio creado');
      cambiarAbierto(false);
    } catch (error) {
      const errorNombre = errorDeCampo(error, 'nombre');
      if (errorNombre) setError('nombre', { message: errorNombre });
      else setErrorServidor(normalizarError(error).message);
    }
  });

  return (
    <Dialog open={abierto} onOpenChange={cambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ministerio ? 'Editar ministerio' : 'Nuevo ministerio'}</DialogTitle>
          <DialogDescription>
            Los coordinadores y los integrantes se gestionan desde el detalle del ministerio.
          </DialogDescription>
        </DialogHeader>
        <form id="form-ministerio" onSubmit={enviar} noValidate className="flex flex-col gap-4">
          {errorServidor && <Alert variante="peligro">{errorServidor}</Alert>}
          <FormField label="Nombre" requerido error={errors.nombre?.message}>
            <Input autoComplete="off" {...register('nombre')} />
          </FormField>
          <FormField label="Descripción" error={errors.descripcion?.message}>
            <Textarea {...register('descripcion')} />
          </FormField>
        </form>
        <DialogFooter>
          <Button variante="contorno" onClick={() => cambiarAbierto(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="form-ministerio" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
