import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import type { Permiso } from '@/app/tipos/comunes';
import { SesionService } from './sesion.service';

/**
 * Exige sesión (si no, redirige a /login?redirect=) y, opcionalmente, el permiso de `data.permiso`
 * (si no, /sin-acceso). Es el equivalente de <RutaProtegida> en React.
 * @example { path: 'usuarios', canActivate: [rutaProtegida], data: { permiso: 'usuarios:leer' } }
 */
export const rutaProtegida: CanActivateFn = (ruta, estadoRouter) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  if (sesion.estado() !== 'autenticado') {
    return router.createUrlTree(['/login'], { queryParams: { redirect: estadoRouter.url } });
  }
  const permiso = ruta.data['permiso'] as Permiso | Permiso[] | undefined;
  if (permiso && !sesion.puede(...[permiso].flat())) return router.createUrlTree(['/sin-acceso']);
  return true;
};

/** Pantallas públicas (login, recuperar): si ya hay sesión, va al inicio. */
export const soloAnonimo: CanActivateFn = () => {
  const sesion = inject(SesionService);
  return sesion.estado() === 'autenticado' ? inject(Router).createUrlTree(['/']) : true;
};
