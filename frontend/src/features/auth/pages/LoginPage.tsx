import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { FormField } from '@/components/comunes/FormField';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { normalizarError } from '@/lib/api';
import { CampoPassword } from '../components/CampoPassword';
import { useSesion } from '../contexto';
import { type DatosLogin, esquemaLogin } from '../schemas';

/** Solo se permite redirigir a rutas internas (evita redirecciones abiertas) */
function destinoSeguro(redirect: string | null) {
  return redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';
}

export function LoginPage() {
  const { estado, iniciarSesion } = useSesion();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const destino = destinoSeguro(params.get('redirect'));
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosLogin>({ resolver: zodResolver(esquemaLogin) });

  if (estado === 'autenticado') return <Navigate to={destino} replace />;

  const enviar = handleSubmit(async ({ email, password }) => {
    setErrorServidor(null);
    try {
      await iniciarSesion(email, password);
      navigate(destino, { replace: true });
    } catch (error) {
      const e = normalizarError(error);
      setErrorServidor(
        e.code === 'RATE_LIMITED' ? 'Demasiados intentos, espera un minuto.' : e.message,
      );
    }
  });

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <h1 className="text-center text-base font-medium text-texto-suave">Inicia sesión</h1>
      {errorServidor && <Alert variante="peligro">{errorServidor}</Alert>}
      <FormField label="Correo" error={errors.email?.message}>
        <Input type="email" autoComplete="email" autoFocus {...register('email')} />
      </FormField>
      <FormField label="Contraseña" error={errors.password?.message}>
        <CampoPassword autoComplete="current-password" {...register('password')} />
      </FormField>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
        Entrar
      </Button>
      <Link to="/recuperar" className="text-center text-sm text-primario hover:underline">
        ¿Olvidaste tu contraseña?
      </Link>
    </form>
  );
}
