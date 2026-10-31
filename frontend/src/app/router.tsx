import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ComunesDemo } from '@/dev/ComunesDemo';
import { UiPage } from '@/dev/UiPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MiCuentaPage } from '@/features/auth/pages/MiCuentaPage';
import { RecuperarPage } from '@/features/auth/pages/RecuperarPage';
import { RestablecerPage } from '@/features/auth/pages/RestablecerPage';
import { ConfiguracionPage } from '@/features/configuracion/pages/ConfiguracionPage';
import { UsuariosPage } from '@/features/usuarios/pages/UsuariosPage';
import { InicioPage } from '@/pages/InicioPage';
import { NoEncontradoPage } from '@/pages/NoEncontradoPage';
import { RutaProtegida } from './RutaProtegida';

/**
 * Registro central de rutas.
 * F2–F4: agreguen sus rutas dentro de `children` del layout, envueltas en <RutaProtegida permiso="…">,
 * y su entrada de menú en app/menu.ts con el mismo permiso.
 */
export const rutas: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/recuperar', element: <RecuperarPage /> },
      { path: '/restablecer', element: <RestablecerPage /> },
    ],
  },
  {
    path: '/',
    element: (
      <RutaProtegida>
        <AppLayout />
      </RutaProtegida>
    ),
    children: [
      { index: true, element: <InicioPage /> },
      {
        path: 'usuarios',
        element: (
          <RutaProtegida permiso="usuarios:leer">
            <UsuariosPage />
          </RutaProtegida>
        ),
      },
      {
        path: 'configuracion',
        element: (
          <RutaProtegida permiso="configuracion:leer">
            <ConfiguracionPage />
          </RutaProtegida>
        ),
      },
      { path: 'mi-cuenta', element: <MiCuentaPage /> },
      { path: '*', element: <NoEncontradoPage /> },
    ],
  },
  // Catálogo de componentes, solo en desarrollo
  ...(import.meta.env.DEV
    ? [{ path: '/_dev/ui', element: <UiPage extra={<ComunesDemo />} /> }]
    : []),
];

export function crearRouter() {
  return createBrowserRouter(rutas);
}
