import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { esErrorApi, normalizarError } from '@/app/core/api';
import { NotificarService } from '@/app/core/notificar.service';
import { SelectorMiembros } from '@/app/features/miembros/selector-miembros';
import type { EventoDetalle } from '@/app/tipos/eventos';
import { EventosService } from './eventos.service';

const MAX_RESPONSABLES = 10;

/** Editar responsables con SelectorMiembros múltiple (máx. 10). Un 422 indica qué miembro no es válido (F3-04). */
@Component({
  selector: 'app-responsables-dialogo',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, SelectorMiembros],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Responsables del evento</h2>
    <mat-dialog-content>
      <p class="texto-suave">Hasta {{ max }} miembros activos.</p>
      <app-selector-miembros etiqueta="Responsables" [multiple]="true" [(seleccion)]="ids" />
      <p
        class="texto-suave"
        [class.texto-peligro]="excedido()"
        [attr.role]="excedido() ? 'alert' : null"
      >
        {{
          excedido()
            ? 'Máximo ' + max + ' responsables.'
            : ids().length + ' de ' + max + ' seleccionados'
        }}
      </p>
      @if (error()) {
        <div class="alerta alerta-peligro" role="alert">
          @if (error()!.detalles.length > 0) {
            <ul>
              @for (d of error()!.detalles; track d) {
                <li>{{ d }}</li>
              }
            </ul>
          } @else {
            {{ error()!.mensaje }}
          }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        matButton="outlined"
        type="button"
        [disabled]="guardando()"
        (click)="ref.close(false)"
      >
        Cancelar
      </button>
      <button
        matButton="filled"
        type="button"
        [disabled]="excedido() || guardando()"
        (click)="guardar()"
      >
        {{ guardando() ? 'Guardando…' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    ul {
      margin: 0;
      padding-left: 16px;
    }
  `,
})
export class ResponsablesDialogo {
  protected readonly evento = inject<EventoDetalle>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ResponsablesDialogo, boolean>);
  private readonly servicio = inject(EventosService);
  private readonly notificar = inject(NotificarService);
  protected readonly max = MAX_RESPONSABLES;
  protected readonly ids = signal(this.evento.responsables.map((r) => r.id));
  protected readonly excedido = computed(() => this.ids().length > MAX_RESPONSABLES);
  protected readonly guardando = signal(false);
  protected readonly error = signal<{ mensaje: string; detalles: string[] } | null>(null);

  protected guardar() {
    this.error.set(null);
    this.guardando.set(true);
    this.servicio.asignarResponsables(this.evento.id, this.ids()).subscribe({
      next: () => {
        this.notificar.exito('Responsables guardados');
        this.ref.close(true);
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.error.set({
          mensaje: normalizarError(e).message,
          detalles: esErrorApi(e) ? (e.details ?? []).map((d) => d.mensaje) : [],
        });
      },
    });
  }
}
