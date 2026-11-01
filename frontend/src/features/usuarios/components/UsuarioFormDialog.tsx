import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
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
import { Input } from '@/components/ui/input';
import { errorDeCampo, normalizarError } from '@/lib/api';
import { ETIQUETAS_ROL, opcionesDe } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { Usuario } from '@/types/usuarios';
import { useGuardarUsuario } from '../hooks';
import { type DatosUsuario, esquemaUsuario } from '../schemas';

interface Props {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  /** Usuario a editar; sin él, el diálogo crea uno nuevo */
  usuario?: Usuario | null;
}

export function UsuarioFormDialog({ abierto, alCambiarAbierto, usuario }: Props) {
  const guardar = useGuardarUsuario();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosUsuario>({ resolver: zodResolver(esquemaUsuario) });

  function cambiarAbierto(valor: boolean) {
    if (!valor) setErrorServidor(null);
    alCambiarAbierto(valor);
  }

  useEffect(() => {
    if (abierto) {
      reset(
        usuario
          ? { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
          : { nombre: '', email: '', rol: undefined },
      );
    }
  }, [abierto, usuario, reset]);

  const enviar = handleSubmit(async (datos) => {
    setErrorServidor(null);
    try {
      await guardar.mutateAsync({ id: usuario?.id, datos });
      notificar.exito(
        usuario ? 'Usuario actualizado' : 'Usuario creado. Le enviamos un correo de invitación.',
      );
      cambiarAbierto(false);
    } catch (error) {
      // 409 (correo duplicado) va al campo; 422 (último admin) y otros, al diálogo
      const errorEmail = errorDeCampo(error, 'email');
      if (errorEmail) setError('email', { message: errorEmail });
      else setErrorServidor(normalizarError(error).message);
    }
  });

  return (
    <Dialog open={abierto} onOpenChange={cambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {usuario
              ? 'Los cambios de rol se aplican en su próximo inicio de sesión.'
              : 'Recibirá un correo para configurar su contraseña.'}
          </DialogDescription>
        </DialogHeader>
        <form id="form-usuario" onSubmit={enviar} noValidate className="flex flex-col gap-4">
          {errorServidor && <Alert variante="peligro">{errorServidor}</Alert>}
          <FormField label="Nombre" requerido error={errors.nombre?.message}>
            <Input autoComplete="off" {...register('nombre')} />
          </FormField>
          <FormField label="Correo" requerido error={errors.email?.message}>
            <Input type="email" autoComplete="off" {...register('email')} />
          </FormField>
          <Controller
            control={control}
            name="rol"
            render={({ field }) => (
              <FormField label="Rol" requerido error={errors.rol?.message}>
                <SelectEnum
                  opciones={opcionesDe(ETIQUETAS_ROL)}
                  valor={field.value}
                  alCambiar={field.onChange}
                  placeholder="Selecciona un rol"
                />
              </FormField>
            )}
          />
        </form>
        <DialogFooter>
          <Button variante="contorno" onClick={() => cambiarAbierto(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="form-usuario" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
