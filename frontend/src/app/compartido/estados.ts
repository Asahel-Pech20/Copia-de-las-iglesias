import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  AlertTriangle,
  Inbox,
  LucideAngularModule,
  type LucideIconData,
  RotateCw,
} from 'lucide-angular';
import { normalizarError } from '@/app/core/api';

/**
 * Estado vacío de una vista de datos (obligatorio en cada listado, AGENTS.md §4).
 * La acción sugerida va como contenido proyectado.
 */
@Component({
  selector: 'app-estado-vacio',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="estado">
      <lucide-icon [img]="icono()" [size]="40" class="texto-suave" aria-hidden="true" />
      <p class="titulo">{{ titulo() }}</p>
      @if (descripcion()) {
        <p class="texto-suave descripcion">{{ descripcion() }}</p>
      }
      <ng-content />
    </div>
  `,
  styleUrl: './estados.css',
})
export class EstadoVacio {
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>();
  readonly icono = input<LucideIconData>(Inbox);
}

/** Estado de error con el mensaje del servidor y botón reintentar. */
@Component({
  selector: 'app-estado-error',
  imports: [LucideAngularModule, MatButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="estado" role="alert">
      <lucide-icon [img]="iconoError" [size]="40" class="texto-peligro" aria-hidden="true" />
      <p class="titulo">No se pudo cargar la información</p>
      <p class="texto-suave descripcion">{{ mensaje() }}</p>
      <button matButton="outlined" type="button" (click)="reintentar.emit()">
        <lucide-icon [img]="iconoReintentar" [size]="16" aria-hidden="true" /> Reintentar
      </button>
    </div>
  `,
  styleUrl: './estados.css',
})
export class EstadoError {
  readonly error = input<unknown>();
  readonly reintentar = output();
  protected readonly mensaje = computed(() => normalizarError(this.error()).message);
  protected readonly iconoError = AlertTriangle;
  protected readonly iconoReintentar = RotateCw;
}

/** Esqueleto de carga para tablas y listas. */
@Component({
  selector: 'app-esqueleto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="esqueleto" role="status" aria-label="Cargando">
      @for (f of indices(filas()); track f) {
        <div class="fila-esqueleto">
          @for (c of indices(columnas()); track c) {
            <span class="bloque"></span>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './estados.css',
})
export class Esqueleto {
  readonly filas = input(5);
  readonly columnas = input(4);
  protected indices(n: number) {
    return Array.from({ length: n }, (_, i) => i);
  }
}
