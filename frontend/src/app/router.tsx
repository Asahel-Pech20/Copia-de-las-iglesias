import { createBrowserRouter, type RouteObject } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ComunesDemo } from '@/dev/ComunesDemo';
import { SelectorMiembrosDemo } from '@/dev/SelectorMiembrosDemo';
import { UiPage } from '@/dev/UiPage';
import { AnunciosPage } from '@/features/anuncios/pages/AnunciosPage';
import { CarteleraPage } from '@/features/anuncios/pages/CarteleraPage';
import { AsistenciaPage } from '@/features/asistencia/pages/AsistenciaPage';
import { PaseListaPage } from '@/features/asistencia/pages/PaseListaPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MiCuentaPage } from '@/features/auth/pages/MiCuentaPage';
import { RecuperarPage } from '@/features/auth/pages/RecuperarPage';
import { RestablecerPage } from '@/features/auth/pages/RestablecerPage';
import { ConfiguracionPage } from '@/features/configuracion/pages/ConfiguracionPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { DonacionesPage } from '@/features/donaciones/pages/DonacionesPage';
import { EventoDetallePage } from '@/features/eventos/pages/EventoDetallePage';
import { EventoFormPage } from '@/features/eventos/pages/EventoFormPage';
import { EventosPage } from '@/features/eventos/pages/EventosPage';
import { MiembroFormPage } from '@/features/miembros/pages/MiembroFormPage';
import { MiembroPerfilPage } from '@/features/miembros/pages/MiembroPerfilPage';
import { MiembrosPage } from '@/features/miembros/pages/MiembrosPage';
import { MinisterioDetallePage } from '@/features/ministerios/pages/MinisterioDetallePage';
import { MinisteriosPage } from '@/features/ministerios/pages/MinisteriosPage';
import { ReportesPage } from '@/features/reportes/pages/ReportesPage';
import { UsuariosPage } from '@/features/usuarios/pages/UsuariosPage';
import { NoEncontradoPage } from '@/pages/NoEncontradoPage';
import { RutaProtegida } from './RutaProtegida';

/**
 * Registro central de rutas.
 * F2–F4: agreguen sus rutas dentro de `children` del layout, envueltas en <RutaProtegida permiso="…">,
 * y su entrada de menú en app/menu.ts con el mismo permiso.
 */
export const rutas: RouteObject[] = [
  // F3-13: cartelera pública, sin sesión ni layout administrativo
  { path: '/cartelera', element: <CarteleraPage /> },
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
      { index: true, element: <DashboardPage /> },
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
      // F2: miembros y ministerios
      {
        path: 'miembros',
        children: [
          {
            index: true,
            element: (
              <RutaProtegida permiso="miembros:leer">
                <MiembrosPage />
              </RutaProtegida>
            ),
          },
          {
            path: 'nuevo',
            element: (
              <RutaProtegida permiso="miembros:crear">
                <MiembroFormPage />
              </RutaProtegida>
            ),
          },
          {
            path: ':id',
            element: (
              <RutaProtegida permiso="miembros:leer">
                <MiembroPerfilPage />
              </RutaProtegida>
            ),
          },
          {
            path: ':id/editar',
            element: (
              <RutaProtegida permiso="miembros:editar">
                <MiembroFormPage />
              </RutaProtegida>
            ),
          },
        ],
      },
      {
        path: 'ministerios',
        children: [
          {
            index: true,
            element: (
              <RutaProtegida permiso="ministerios:leer">
                <MinisteriosPage />
              </RutaProtegida>
            ),
          },
          {
            path: ':id',
            element: (
              <RutaProtegida permiso="ministerios:leer">
                <MinisterioDetallePage />
              </RutaProtegida>
            ),
          },
        ],
      },
      // F3: eventos, asistencia y anuncios
      {
        path: 'eventos',
        children: [
          {
            index: true,
            element: (
              <RutaProtegida permiso="eventos:leer">
                <EventosPage />
              </RutaProtegida>
            ),
          },
          {
            path: 'nuevo',
            element: (
              <RutaProtegida permiso={['eventos:crear', 'eventos:crear-propio']}>
                <EventoFormPage />
              </RutaProtegida>
            ),
          },
          {
            path: ':id',
            element: (
              <RutaProtegida permiso="eventos:leer">
                <EventoDetallePage />
              </RutaProtegida>
            ),
          },
          {
            path: ':id/editar',
            element: (
              <RutaProtegida permiso={['eventos:editar', 'eventos:editar-propio']}>
                <EventoFormPage />
              </RutaProtegida>
            ),
          },
          {
            path: ':id/asistencia',
            element: (
              <RutaProtegida permiso={['asistencia:leer', 'asistencia:leer-propio']}>
                <PaseListaPage />
              </RutaProtegida>
            ),
          },
        ],
      },
      {
        path: 'asistencia',
        element: (
          <RutaProtegida permiso={['asistencia:leer', 'asistencia:leer-propio']}>
            <AsistenciaPage />
          </RutaProtegida>
        ),
      },
      {
        path: 'anuncios',
        element: (
          <RutaProtegida permiso="anuncios:leer">
            <AnunciosPage />
          </RutaProtegida>
        ),
      },
      // F4: donaciones y reportes
      {
        path: 'donaciones',
        element: (
          <RutaProtegida permiso="donaciones:leer">
            <DonacionesPage />
          </RutaProtegida>
        ),
      },
      {
        path: 'reportes',
        element: (
          <RutaProtegida
            permiso={['reportes:generales', 'reportes:generales-propio', 'reportes:ingresos']}
          >
            <ReportesPage />
          </RutaProtegida>
        ),
      },
      { path: 'mi-cuenta', element: <MiCuentaPage /> },
      { path: '*', element: <NoEncontradoPage /> },
    ],
  },
  // Catálogo de componentes, solo en desarrollo
  ...(import.meta.env.DEV
    ? [
        {
          path: '/_dev/ui',
          element: (
            <UiPage
              extra={
                <>
                  <ComunesDemo />
                  <SelectorMiembrosDemo />
                </>
              }
            />
          ),
        },
      ]
    : []),
];

export function crearRouter() {
  return createBrowserRouter(rutas);
}
