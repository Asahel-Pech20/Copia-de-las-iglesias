import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Check, History, LucideAngularModule, X } from 'lucide-angular';
import { BadgeEstado } from '@/app/compartido/badge-estado';
import { EstadoError, EstadoVacio, Esqueleto } from '@/app/compartido/estados';
import { Paginacion } from '@/app/compartido/paginacion';
import { formatearFechaHora } from '@/app/core/formato';
import { valorDe } from '@/app/core/recurso';
import { EventosService } from '@/app/features/eventos/eventos.service';
import { SelectorMiembros } from '@/app/features/miembros/selector-miembros';
import type { AsistenciaHistorial } from '@/app/tipos/asistencia';
import { AsistenciaService } from './asistencia.service';

export interface FiltrosHistorial {
  desde: string;
  hasta: string;
  miembroId: string;
  eventoId: string;
  page: number;
}

/**
 * Historial filtrable por rango, evento y miembro; los filtros viven en la URL (F3-08).
 * Para el perfil del miembro (F2-04) usar directamente `AsistenciaService.listar({ miembroId })`.
 */
@Component({
  selector: 'app-historial-asistencia',
  imports: [
    RouterLink,
    MatTableModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    LucideAngularModule,
    BadgeEstado,
    EstadoError,
    EstadoVacio,
    Esqueleto,
    Paginacion,
    SelectorMiembros,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filtros">
      <mat-form-field subscriptSizing="dynamic" class="fecha">
        <mat-label>Desde</mat-label>
        <input matInput type="date" [value]="filtros().desde" (change)="fecha('desde', $event)" />
      </mat-form-field>
      <mat-form-field subscriptSizing="dynamic" class="fecha">
        <mat-label>Hasta</mat-label>
        <input matInput type="date" [value]="filtros().hasta" (change)="fecha('hasta', $event)" />
      </mat-form-field>
      <mat-form-field subscriptSizing="dynamic" class="evento">
        <mat-label>Evento</mat-label>
        <mat-select [value]="filtros().eventoId" (valueChange)="cambio.emit({ eventoId: $event })">
          <mat-option value="">Todos los eventos</mat-option>
          @for (e of opcionesEvento(); track e.id) {
            <mat-option [value]="e.id">{{ e.titulo }} ({{ fechaHora(e.fechaInicio) }})</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <div class="miembro">
        <app-selector-miembros
          etiqueta="Miembro"
          placeholder="Todos los miembros"
          [incluirInactivos]="true"
          [seleccion]="miembroSeleccion()"
          (seleccionChange)="cambio.emit({ miembroId: $event[0] ?? '' })"
        />
      </div>
    </div>

    <section class="tarjeta">
      @if (consulta.isLoading() && !consulta.hasValue()) {
        <app-esqueleto [columnas]="4" />
      } @else if (consulta.error()) {
        <app-estado-error [error]="consulta.error()" (reintentar)="consulta.reload()" />
      } @else if (filas().length === 0) {
        <app-estado-vacio
          [icono]="iconoVacio"
          titulo="No hay asistencia registrada con estos filtros"
        />
      } @else {
        <div class="contenedor-tabla">
          <table mat-table [dataSource]="filas()" aria-label="Historial de asistencia">
            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let a">{{ fechaHora(a.evento.fechaInicio) }}</td>
            </ng-container>
            <ng-container matColumnDef="evento">
              <th mat-header-cell *matHeaderCellDef>Evento</th>
              <td mat-cell *matCellDef="let a">
                <a [routerLink]="['/eventos', a.evento.id]">{{ a.evento.titulo }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="miembro">
              <th mat-header-cell *matHeaderCellDef>Miembro</th>
              <td mat-cell *matCellDef="let a">
                <a [routerLink]="['/miembros', a.miembro.id]" class="fuerte"
                  >{{ a.miembro.nombre }} {{ a.miembro.apellidos }}</a
                >
              </td>
            </ng-container>
            <ng-container matColumnDef="presente">
              <th mat-header-cell *matHeaderCellDef>Asistencia</th>
              <td mat-cell *matCellDef="let a">
                <span class="presencia">
                  <lucide-icon
                    [img]="a.presente ? iconos.Check : iconos.X"
                    [size]="14"
                    aria-hidden="true"
                  />
                  <app-badge-estado
                    [etiqueta]="a.presente ? 'Presente' : 'Ausente'"
                    [variante]="a.presente ? 'exito' : 'peligro'"
                  />
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="registradoPor">
              <th mat-header-cell *matHeaderCellDef>Registró</th>
              <td mat-cell *matCellDef="let a">{{ a.registradoPor.nombre }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let fila; columns: columnas"></tr>
          </table>
        </div>
        <app-paginacion [meta]="consulta.value()!.meta" (cambio)="cambio.emit({ page: $event })" />
      }
    </section>
  `,
  styles: `
    .fecha {
      width: 10rem;
    }
    .evento {
      min-width: 16rem;
    }
    .miembro {
      min-width: 16rem;
      flex: 1;
      max-width: 24rem;
    }
    .presencia {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    @media (max-width: 639px) {
      .fecha,
      .evento,
      .miembro {
        width: 100%;
        max-width: none;
      }
    }
  `,
})
export class HistorialAsistencia {
  readonly filtros = input.required<FiltrosHistorial>();
  readonly cambio = output<Partial<FiltrosHistorial>>();

  private readonly servicio = inject(AsistenciaService);
  private readonly eventosService = inject(EventosService);

  protected readonly consulta = rxResource({
    params: () => {
      const f = this.filtros();
      return {
        page: f.page,
        desde: f.desde || undefined,
        hasta: f.hasta || undefined,
        miembroId: f.miembroId || undefined,
        eventoId: f.eventoId || undefined,
      };
    },
    stream: ({ params }) => this.servicio.listar(params),
  });
  // Eventos recientes para el filtro por evento
  private readonly eventos = rxResource({
    stream: () => this.eventosService.listar({ limit: 50, orden: 'fechaInicio:desc' }),
  });
  protected readonly opcionesEvento = computed(() =>
    (valorDe(this.eventos)?.data ?? []).filter(
      (e) => e.estado !== 'PROGRAMADO' || e.id === this.filtros().eventoId,
    ),
  );
  protected readonly filas = computed<AsistenciaHistorial[]>(
    () => valorDe(this.consulta)?.data ?? [],
  );
  protected readonly miembroSeleccion = computed(() =>
    this.filtros().miembroId ? [this.filtros().miembroId] : [],
  );

  protected readonly columnas = ['fecha', 'evento', 'miembro', 'presente', 'registradoPor'];
  protected readonly iconos = { Check, X };
  protected readonly iconoVacio = History;
  protected readonly fechaHora = formatearFechaHora;

  protected fecha(campo: 'desde' | 'hasta', evento: Event) {
    this.cambio.emit({ [campo]: (evento.target as HTMLInputElement).value });
  }
}
