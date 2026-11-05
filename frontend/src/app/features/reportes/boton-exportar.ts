import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Download, FileSpreadsheet, FileText, LucideAngularModule } from 'lucide-angular';
import { NotificarService } from '@/app/core/notificar.service';
import { SesionService } from '@/app/core/sesion.service';
import type { FiltrosReporte, FormatoDescarga, TipoReporte } from '@/app/tipos/reportes';
import { permisosDeReporte } from './permisos';
import { ReportesService } from './reportes.service';

/**
 * Menú "Exportar" con PDF y Excel. Se oculta solo si el usuario no puede ver ese reporte, así
 * F2/F3 pueden colocarlo sin revisar permisos.
 * @example <app-boton-exportar tipo="miembros" [filtros]="{ estado: 'activo' }" />
 */
@Component({
  selector: 'app-boton-exportar',
  imports: [MatButton, MatMenu, MatMenuItem, MatMenuTrigger, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (permitido()) {
      <button
        matButton="outlined"
        type="button"
        [matMenuTriggerFor]="menu"
        [disabled]="descargando()"
      >
        <lucide-icon [img]="iconos.Download" [size]="16" aria-hidden="true" />
        {{ descargando() ? 'Descargando…' : etiqueta() }}
      </button>
      <mat-menu #menu="matMenu" xPosition="before">
        <button mat-menu-item type="button" (click)="pedir('pdf')">
          <lucide-icon [img]="iconos.FileText" [size]="16" aria-hidden="true" /> PDF
        </button>
        <button mat-menu-item type="button" (click)="pedir('xlsx')">
          <lucide-icon [img]="iconos.FileSpreadsheet" [size]="16" aria-hidden="true" /> Excel
        </button>
      </mat-menu>
    }
  `,
})
export class BotonExportar {
  readonly tipo = input.required<TipoReporte>();
  /** Filtros actuales de la pantalla; se envían tal cual a la descarga */
  readonly filtros = input<FiltrosReporte>({});
  readonly etiqueta = input('Exportar');

  private readonly sesion = inject(SesionService);
  private readonly servicio = inject(ReportesService);
  private readonly notificar = inject(NotificarService);

  protected readonly permitido = computed(() =>
    this.sesion.puede(...permisosDeReporte(this.tipo())),
  );
  protected readonly descargando = signal(false);
  protected readonly iconos = { Download, FileText, FileSpreadsheet };

  protected pedir(formato: FormatoDescarga) {
    this.descargando.set(true);
    this.servicio.descargar(this.tipo(), this.filtros(), formato).subscribe({
      next: (archivo) => {
        this.descargando.set(false);
        this.notificar.exito(`Descargado ${archivo.nombre}`);
      },
      error: (e: unknown) => {
        this.descargando.set(false);
        this.notificar.error(e);
      },
    });
  }
}
