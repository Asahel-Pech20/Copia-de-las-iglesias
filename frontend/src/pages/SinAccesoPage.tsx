import { ShieldX } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function SinAccesoPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <ShieldX className="size-10 text-peligro" aria-hidden />
      <h1 className="text-xl font-semibold">No tienes acceso</h1>
      <p className="max-w-sm text-texto-suave">
        Tu rol no tiene permiso para ver esta sección. Si crees que es un error, contacta al
        administrador.
      </p>
      <Button asChild variante="contorno">
        <Link to="/">Ir al inicio</Link>
      </Button>
    </div>
  );
}
