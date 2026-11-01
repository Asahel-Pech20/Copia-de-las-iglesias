import { Outlet } from 'react-router';
import { Card } from '@/components/ui/card';
import { MarcaIglesia } from './MarcaIglesia';

/** Layout de pantallas públicas (login, recuperar, restablecer). */
export function AuthLayout() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-fondo p-4">
      <Card className="flex w-full max-w-sm flex-col gap-6 p-6">
        <MarcaIglesia grande />
        <Outlet />
      </Card>
    </main>
  );
}
