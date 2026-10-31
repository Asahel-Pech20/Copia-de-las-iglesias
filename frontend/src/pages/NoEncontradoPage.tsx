import { SearchX } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function NoEncontradoPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchX className="size-10 text-texto-suave" aria-hidden />
      <h1 className="text-xl font-semibold">Página no encontrada</h1>
      <p className="max-w-sm text-texto-suave">La dirección que buscas no existe.</p>
      <Button asChild variante="contorno">
        <Link to="/">Ir al inicio</Link>
      </Button>
    </div>
  );
}
