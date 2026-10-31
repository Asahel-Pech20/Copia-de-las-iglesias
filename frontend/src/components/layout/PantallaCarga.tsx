import { Loader2 } from 'lucide-react';

/** Pantalla completa mientras se resuelve la sesión al cargar la app. */
export function PantallaCarga() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-fondo" role="status">
      <Loader2 className="size-8 animate-spin text-primario" aria-hidden />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
