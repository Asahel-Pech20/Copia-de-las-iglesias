import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { normalizarError } from './api';

/**
 * Toasts estándar tras cada mutación (AGENTS.md §4 UX).
 * @example next: () => this.notificar.exito('Miembro guardado'), error: (e) => this.notificar.error(e)
 */
@Injectable({ providedIn: 'root' })
export class NotificarService {
  private readonly snack = inject(MatSnackBar);

  exito(mensaje: string) {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }

  error(error: unknown) {
    this.snack.open(normalizarError(error).message, 'Cerrar', {
      duration: 6000,
      politeness: 'assertive',
    });
  }

  info(mensaje: string) {
    this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
  }
}
