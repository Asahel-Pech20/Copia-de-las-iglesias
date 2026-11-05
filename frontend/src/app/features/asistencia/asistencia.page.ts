import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { PageHeader } from '@/app/compartido/page-header';
import { filtrosURL } from '@/app/core/filtros-url';
import { aFechaApi } from '@/app/core/formato';
import { HistorialAsistencia } from './historial-asistencia';
import { ResumenAsistencia } from './resumen-asistencia';
import { SeleccionEvento } from './seleccion-evento';

const PESTANAS = ['pasar-lista', 'historial', 'resumen'] as const;

/** /asistencia — pasar lista (F3-06), historial (F3-08) y resumen (F3-09). Pestaña y filtros en la URL. */
@Component({
  selector: 'app-asistencia',
  imports: [
    MatTabGroup,
    MatTab,
    MatTabContent,
    PageHeader,
    SeleccionEvento,
    HistorialAsistencia,
    ResumenAsistencia,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header titulo="Asistencia" descripcion="Pase de lista, historial y resúmenes." />
    <mat-tab-group
      animationDuration="0ms"
      [selectedIndex]="indice()"
      (selectedIndexChange)="cambiarPestana($event)"
    >
      <mat-tab label="Pasar lista">
        <ng-template matTabContent>
          <div class="pestana">
            <app-seleccion-evento
              [fecha]="filtros.valores().fecha"
              (cambioFecha)="filtros.cambiar({ fecha: $event })"
            />
          </div>
        </ng-template>
      </mat-tab>
      <mat-tab label="Historial">
        <ng-template matTabContent>
          <div class="pestana">
            <app-historial-asistencia
              [filtros]="filtros.valores()"
              (cambio)="filtros.cambiar($event)"
            />
          </div>
        </ng-template>
      </mat-tab>
      <mat-tab label="Resumen">
        <ng-template matTabContent>
          <div class="pestana">
            <app-resumen-asistencia
              [filtros]="filtros.valores()"
              (cambio)="filtros.cambiar($event)"
            />
          </div>
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: `
    .pestana {
      padding-top: 16px;
    }
  `,
})
export class AsistenciaPage {
  protected readonly filtros = filtrosURL({
    tab: 'pasar-lista',
    fecha: aFechaApi(new Date()),
    desde: '',
    hasta: '',
    miembroId: '',
    eventoId: '',
    page: 1,
    periodo: 'semanal',
    ministerioId: '',
  });

  protected indice() {
    const i = PESTANAS.indexOf(this.filtros.valores().tab as (typeof PESTANAS)[number]);
    return i < 0 ? 0 : i;
  }

  protected cambiarPestana(indice: number) {
    const tab = PESTANAS[indice] ?? 'pasar-lista';
    if (tab === this.filtros.valores().tab) return;
    this.filtros.cambiar({ tab, desde: '', hasta: '' });
  }
}
