import { useSesion } from '@/features/auth/contexto';

// Página de inicio provisional: F4 la reemplaza por el dashboard (F4-06)
export function InicioPage() {
  const { usuario } = useSesion();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Hola, {usuario?.nombre}</h1>
      <p className="text-texto-suave">Bienvenido al sistema de administración de la iglesia.</p>
    </div>
  );
}
