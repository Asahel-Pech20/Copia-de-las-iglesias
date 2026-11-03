import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { firstValueFrom, isObservable, type Observable } from 'rxjs';
import { normalizarError } from '@/app/core/api';

export interface OpcionesConfirmar {
  titulo: string;
  descripcion?: string;
  /** Texto del botón de confirmar (por defecto "Confirmar") */
  textoConfirmar?: string;
  /** Botón rojo para acciones destructivas */
  peligro?: boolean;
  /** Pide un motivo: "opcional" u "obligatorio" (no deja confirmar si está vacío) */
  motivo?: 'no' | 'opcional' | 'obligatorio';
  /**
   * Recibe el motivo (o undefined). Mientras corre muestra "procesando"; si falla (p. ej. 422),
   * el diálogo sigue abierto y muestra el mensaje del servidor.
   */
  alConfirmar: (motivo?: string) => Observable<unknown> | Promise<unknown> | void;
}

@Component({
  selector: 'app-confirmar-dialogo',
  imports: [
    FormsModule,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ datos.titulo }}</h2>
    <mat-dialog-content>
      @if (datos.descripcion) {
        <p class="texto-suave">{{ datos.descripcion }}</p>
      }
      @if (pideMotivo) {
        <mat-form-field class="campo-completo">
          <mat-label>Motivo{{ datos.motivo === 'obligatorio' ? ' *' : '' }}</mat-label>
          <textarea
            matInput
            rows="3"
            maxlength="500"
            [ngModel]="motivo()"
            (ngModelChange)="motivo.set($event)"
            [required]="datos.motivo === 'obligatorio'"
          ></textarea>
        </mat-form-field>
      }
      @if (errorServidor()) {
        <p class="alerta alerta-peligro" role="alert">{{ errorServidor() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        matButton="outlined"
        type="button"
        (click)="ref.close(false)"
        [disabled]="procesando()"
      >
        Cancelar
      </button>
      <button
        matButton="filled"
        type="button"
        [class.boton-peligro]="datos.peligro"
        (click)="confirmar()"
        [disabled]="faltaMotivo() || procesando()"
      >
        {{ procesando() ? 'Procesando…' : (datos.textoConfirmar ?? 'Confirmar') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .boton-peligro {
      --mat-button-filled-container-color: var(--peligro);
      --mat-button-filled-label-text-color: var(--peligro-texto);
    }
  `,
})
export class ConfirmarDialogo {
  protected readonly datos = inject<OpcionesConfirmar>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ConfirmarDialogo, boolean>);
  protected readonly motivo = signal('');
  protected readonly procesando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly pideMotivo = (this.datos.motivo ?? 'no') !== 'no';

  protected faltaMotivo() {
    return this.datos.motivo === 'obligatorio' && this.motivo().trim() === '';
  }

  protected async confirmar() {
    if (this.faltaMotivo()) return;
    this.procesando.set(true);
    this.ref.disableClose = true;
    this.errorServidor.set(null);
    try {
      const resultado = this.datos.alConfirmar(
        this.pideMotivo ? this.motivo().trim() || undefined : undefined,
      );
      if (isObservable(resultado)) await firstValueFrom(resultado, { defaultValue: undefined });
      else await resultado;
      this.ref.close(true);
    } catch (error) {
      this.errorServidor.set(normalizarError(error).message);
    } finally {
      this.procesando.set(false);
      this.ref.disableClose = false;
    }
  }
}

/**
 * Confirmación para acciones destructivas o irreversibles (desactivar, cancelar, anular, eliminar).
 * @example
 * this.confirmar.abrir({ titulo: 'Desactivar miembro', peligro: true, motivo: 'opcional',
 *   alConfirmar: (motivo) => this.servicio.cambiarEstado(id, { activo: false, motivo }) });
 */
@Injectable({ providedIn: 'root' })
export class ConfirmarService {
  private readonly dialog = inject(MatDialog);

  /** Resuelve true si se confirmó y la acción terminó bien. */
  abrir(opciones: OpcionesConfirmar): Promise<boolean> {
    const ref = this.dialog.open<ConfirmarDialogo, OpcionesConfirmar, boolean>(ConfirmarDialogo, {
      data: opciones,
      width: '28rem',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'first-tabbable',
    });
    return firstValueFrom(ref.afterClosed()).then((r) => r === true);
  }
}
