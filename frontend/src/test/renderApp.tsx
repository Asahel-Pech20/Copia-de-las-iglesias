import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { Providers } from '@/app/providers';
import { rutas } from '@/app/router';
import { PantallaCarga } from '@/components/layout/PantallaCarga';
import { useSesion } from '@/features/auth/contexto';
import { sesionMock } from '@/mocks/db';
import { crearQueryClient } from '@/lib/queryClient';

function Puerta({ ruta }: { ruta: string }) {
  const { estado } = useSesion();
  const [router] = useState(() => createMemoryRouter(rutas, { initialEntries: [ruta] }));
  if (estado === 'cargando') return <PantallaCarga />;
  return <RouterProvider router={router} />;
}

/**
 * Renderiza la app completa (rutas + providers + MSW) en una ruta.
 * Con `como` se abre la sesión de ese usuario mock (ids de mocks/datos/b1.ts), como si tuviera la cookie de refresh.
 * @example await renderApp('/usuarios', { como: 'u-tesorero' })
 */
export async function renderApp(ruta: string, { como }: { como?: string } = {}) {
  if (como) sesionMock.abrir(como);
  const usuario = userEvent.setup();
  const queryClient = crearQueryClient();
  const resultado = render(
    <Providers queryClient={queryClient}>
      <Puerta ruta={ruta} />
    </Providers>,
  );
  // Espera a que se resuelva la sesión inicial
  await screen.findByRole('main', {}, { timeout: 3000 }).catch(() => undefined);
  return { usuario, queryClient, ...resultado };
}
