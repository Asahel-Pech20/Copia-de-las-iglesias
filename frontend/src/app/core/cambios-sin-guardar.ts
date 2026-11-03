import { inject } from '@angular/core';
import type { CanDeactivateFn } from '@angular/router';
import { ConfirmarService } from '@/app/compartido/confirmar-dialogo';

/** Página con formulario que puede tener cambios sin guardar. */
export interface ConCambiosSinGuardar {
  tieneCambiosSinGuardar(): boolean;
}

/**
 * Salir con cambios sin guardar pide confirmación (equivale a useBlocker en React).
 * Para cerrar la pestaña, la página escucha además `beforeunload`.
 * @example { path: 'nuevo', component: MiembroFormPage, canDeactivate: [cambiosSinGuardar] }
 */
export const cambiosSinGuardar: CanDeactivateFn<ConCambiosSinGuardar> = (pagina) => {
  if (!pagina.tieneCambiosSinGuardar()) return true;
  return inject(ConfirmarService).abrir({
    titulo: '¿Salir sin guardar?',
    descripcion: 'Tienes cambios sin guardar en este formulario. Si sales, se perderán.',
    textoConfirmar: 'Salir sin guardar',
    peligro: true,
    alConfirmar: () => undefined,
  });
};
