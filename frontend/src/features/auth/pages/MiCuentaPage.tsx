import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/comunes/FormField';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { errorDeCampo } from '@/lib/api';
import { ETIQUETAS_ROL, formatearFechaHora } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import { cambiarPassword } from '../api';
import { CampoPassword } from '../components/CampoPassword';
import { useSesion } from '../contexto';
import { type DatosCambiarPassword, esquemaCambiarPassword } from '../schemas';

export function MiCuentaPage() {
  const { usuario } = useSesion();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosCambiarPassword>({ resolver: zodResolver(esquemaCambiarPassword) });

  const enviar = handleSubmit(async ({ passwordActual, passwordNueva }) => {
    try {
      await cambiarPassword(passwordActual, passwordNueva);
      reset();
      notificar.exito('Contraseña actualizada');
    } catch (error) {
      const campos = ['passwordActual', 'passwordNueva'] as const;
      const conError = campos.find((c) => errorDeCampo(error, c));
      if (conError) setError(conError, { message: errorDeCampo(error, conError) });
      else notificar.error(error);
    }
  });

  if (!usuario) return null;

  return (
    <>
      <PageHeader titulo="Mi cuenta" />
      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mis datos</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-texto-suave">Nombre</dt>
              <dd>{usuario.nombre}</dd>
              <dt className="text-texto-suave">Correo</dt>
              <dd className="break-all">{usuario.email}</dd>
              <dt className="text-texto-suave">Rol</dt>
              <dd>{ETIQUETAS_ROL[usuario.rol]}</dd>
              <dt className="text-texto-suave">Último acceso</dt>
              <dd>{formatearFechaHora(usuario.ultimoAcceso)}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
              <FormField label="Contraseña actual" error={errors.passwordActual?.message}>
                <CampoPassword autoComplete="current-password" {...register('passwordActual')} />
              </FormField>
              <FormField
                label="Contraseña nueva"
                error={errors.passwordNueva?.message}
                hint="Mínimo 8 caracteres, con al menos una letra y un número."
              >
                <CampoPassword autoComplete="new-password" {...register('passwordNueva')} />
              </FormField>
              <FormField label="Confirmar contraseña nueva" error={errors.confirmacion?.message}>
                <CampoPassword autoComplete="new-password" {...register('confirmacion')} />
              </FormField>
              <Button type="submit" disabled={isSubmitting} className="self-start">
                {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
                Actualizar contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
