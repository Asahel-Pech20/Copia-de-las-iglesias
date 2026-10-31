import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { FormField } from '@/components/comunes/FormField';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { normalizarError } from '@/lib/api';
import { solicitarRecuperacion } from '../api';
import { type DatosRecuperar, esquemaRecuperar } from '../schemas';

export function RecuperarPage() {
  const [enviado, setEnviado] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosRecuperar>({ resolver: zodResolver(esquemaRecuperar) });

  const enviar = handleSubmit(async ({ email }) => {
    setErrorServidor(null);
    try {
      await solicitarRecuperacion(email);
      setEnviado(true);
    } catch (error) {
      setErrorServidor(normalizarError(error).message);
    }
  });

  if (enviado) {
    // Mensaje neutro: no revela si el correo existe
    return (
      <div className="flex flex-col items-center gap-3 text-center" role="status">
        <MailCheck className="size-10 text-exito" aria-hidden />
        <p>Si el correo existe, te enviamos un enlace para restablecer tu contraseña.</p>
        <Link to="/login" className="text-sm text-primario hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="text-base font-medium">Recuperar contraseña</h1>
        <p className="text-texto-suave">Escribe tu correo y te enviaremos un enlace.</p>
      </div>
      {errorServidor && <Alert variante="peligro">{errorServidor}</Alert>}
      <FormField label="Correo" error={errors.email?.message}>
        <Input type="email" autoComplete="email" autoFocus {...register('email')} />
      </FormField>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
        Enviar enlace
      </Button>
      <Link to="/login" className="text-center text-sm text-primario hover:underline">
        Volver a iniciar sesión
      </Link>
    </form>
  );
}
