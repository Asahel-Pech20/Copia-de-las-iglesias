import { useState } from 'react';
import { RouterProvider } from 'react-router';
import { Providers } from '@/app/providers';
import { crearRouter } from '@/app/router';
import { PantallaCarga } from '@/components/layout/PantallaCarga';
import { useSesion } from '@/features/auth/contexto';

// No monta las rutas hasta saber si hay sesión (evita parpadeos hacia /login al recargar)
function PuertaSesion() {
  const { estado } = useSesion();
  const [router] = useState(crearRouter);
  if (estado === 'cargando') return <PantallaCarga />;
  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <Providers>
      <PuertaSesion />
    </Providers>
  );
}
