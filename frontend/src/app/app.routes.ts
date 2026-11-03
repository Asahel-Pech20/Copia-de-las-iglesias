import type { Type } from '@angular/core';
import type { Route, Routes } from '@angular/router';
import { cambiosSinGuardar } from './core/cambios-sin-guardar';
import { rutaProtegida, soloAnonimo } from './core/guards';
import { LoginPage } from './features/auth/login.page';
import { MiCuentaPage } from './features/auth/mi-cuenta.page';
import { RecuperarPage } from './features/auth/recuperar.page';
import { RestablecerPage } from './features/auth/restablecer.page';
import { ConfiguracionPage } from './features/configuracion/configuracion.page';
import { MiembroFormPage } from './features/miembros/miembro-form.page';
import { MiembroPerfilPage } from './features/miembros/miembro-perfil.page';
import { MiembrosPage } from './features/miembros/miembros.page';
import { MinisterioDetallePage } from './features/ministerios/ministerio-detalle.page';
import { MinisteriosPage } from './features/ministerios/ministerios.page';
import { UsuariosPage } from './features/usuarios/usuarios.page';
import { AppLayout } from './layout/app-layout';
import { AuthLayout } from './layout/auth-layout';
import { InicioPage, NoEncontradoPage, SinAccesoPage } from './paginas/paginas-simples';

/**
 * Registro central de rutas (equivale a app/router.tsx de React).
 * Cada ruta protegida declara su permiso en `data.permiso`, igual que en el menú (core/menu.ts).
 */
/** Pantalla pública dentro del layout de autenticación (login, recuperar, restablecer). */
function publica(
  path: string,
  component: Type<unknown>,
  title: string,
  soloSinSesion = false,
): Route {
  return {
    path,
    component: AuthLayout,
    canActivate: soloSinSesion ? [soloAnonimo] : [],
    children: [{ path: '', component, title }],
  };
}

export const routes: Routes = [
  publica('login', LoginPage, 'Iniciar sesión', true),
  publica('recuperar', RecuperarPage, 'Recuperar contraseña'),
  publica('restablecer', RestablecerPage, 'Nueva contraseña'),
  {
    path: '',
    component: AppLayout,
    canActivate: [rutaProtegida],
    canActivateChild: [rutaProtegida],
    children: [
      { path: '', pathMatch: 'full', component: InicioPage, title: 'Inicio' },
      {
        path: 'usuarios',
        component: UsuariosPage,
        data: { permiso: 'usuarios:leer' },
        title: 'Usuarios',
      },
      {
        path: 'configuracion',
        component: ConfiguracionPage,
        data: { permiso: 'configuracion:leer' },
        title: 'Configuración',
      },
      // F2: miembros y ministerios
      {
        path: 'miembros',
        component: MiembrosPage,
        data: { permiso: 'miembros:leer' },
        title: 'Miembros',
      },
      {
        path: 'miembros/nuevo',
        component: MiembroFormPage,
        canDeactivate: [cambiosSinGuardar],
        data: { permiso: 'miembros:crear' },
        title: 'Nuevo miembro',
      },
      {
        path: 'miembros/:id',
        component: MiembroPerfilPage,
        data: { permiso: 'miembros:leer' },
        title: 'Perfil del miembro',
      },
      {
        path: 'miembros/:id/editar',
        component: MiembroFormPage,
        canDeactivate: [cambiosSinGuardar],
        data: { permiso: 'miembros:editar' },
        title: 'Editar miembro',
      },
      {
        path: 'ministerios',
        component: MinisteriosPage,
        data: { permiso: 'ministerios:leer' },
        title: 'Ministerios',
      },
      {
        path: 'ministerios/:id',
        component: MinisterioDetallePage,
        data: { permiso: 'ministerios:leer' },
        title: 'Ministerio',
      },
      { path: 'mi-cuenta', component: MiCuentaPage, title: 'Mi cuenta' },
      { path: 'sin-acceso', component: SinAccesoPage, title: 'Sin acceso' },
      { path: '**', component: NoEncontradoPage, title: 'Página no encontrada' },
    ],
  },
];
