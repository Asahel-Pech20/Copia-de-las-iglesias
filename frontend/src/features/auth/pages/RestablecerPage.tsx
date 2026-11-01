import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';
import { FormField } from '@/components/comunes/FormField';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/card';
import { errorDeCampo, normalizarError } from '@/lib/api';
import { restablecerPassword } from '../api';
import { CampoPassword } from '../components/CampoPassword';
import { type DatosRestablecer, esquemaRestablecer } from '../schemas';

function TokenInvalido() {
  return (
    <div className="flex flex-col items-center gap-3 text-center" role="alert">
      <XCircle className="size-10 text-peligro" aria-hidden />
      <p>El enlace no es válido o ya expiró.</p>
      <Link to="/recuperar" className="text-sm text-primario hover:underline">
        Solicitar un enlace nuevo
      </Link>
    </div>
  );
}

/** /restablecer?token=… — también se usa para la invitación de usuarios nuevos (B1-14). */
export function RestablecerPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [estado, setEstado] = useState<'formulario' | 'listo' | 'invalido'>(
    token ? 'formulario' : 'invalido',
  );
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosRestablecer>({ resolver: zodResolver(esquemaRestablecer) });

  const enviar = handleSubmit(async ({ password }) => {
    setErrorServidor(null);
    try {
      await restablecerPassword(token!, password);
      setEstado('listo');
    } catch (error) {
      if (errorDeCampo(error, 'token')) return setEstado('invalido');
      const errorPassword = errorDeCampo(error, 'password');
      if (errorPassword) return setError('password', { message: errorPassword });
      setErrorServidor(normalizarError(error).message);
    }
  });

  if (estado === 'invalido') return <TokenInvalido />;
  if (estado === 'listo') {
    return (
      <div className="flex flex-col items-center gap-3 text-center" role="status">
        <CheckCircle2 className="size-10 text-exito" aria-hidden />
        <p>Tu contraseña se guardó correctamente.</p>
        <Button asChild>
          <Link to="/login">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <h1 className="text-center text-base font-medium">Nueva contraseña</h1>
      {errorServidor && <Alert variante="peligro">{errorServidor}</Alert>}
      <FormField
        label="Contraseña nueva"
        error={errors.password?.message}
        hint="Mínimo 8 caracteres, con al menos una letra y un número."
      >
        <CampoPassword autoComplete="new-password" autoFocus {...register('password')} />
      </FormField>
      <FormField label="Confirmar contraseña" error={errors.confirmacion?.message}>
        <CampoPassword autoComplete="new-password" {...register('confirmacion')} />
      </FormField>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
        Guardar contraseña
      </Button>
    </form>
  );
}
