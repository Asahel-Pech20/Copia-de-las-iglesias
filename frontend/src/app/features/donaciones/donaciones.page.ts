import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { ConfirmarService } from '@/app/compartido/confirmar-dialogo';
import { PageHeader } from '@/app/compartido/page-header';
import { filtrosURL } from '@/app/core/filtros-url';
import { NotificarService } from '@/app/core/notificar.service';
import { PuedeDirective } from '@/app/core/puede.directive';
import type { Donacion } from '@/app/tipos/donaciones';
import { AportacionesTab } from './aportaciones.tab';
import { DonacionDetalleDialogo, type AccionDetalle } from './donacion-detalle.dialogo';
import { DonacionFormDialogo } from './donacion-form.dialogo';
import { DonacionesService } from './donaciones.service';
import { nombreDonante } from './formato-donacion';
import { ResumenIngresosTab } from './resumen-ingresos.tab';
import { ResumenMensualTab } from './resumen-mensual.tab';

const PESTANAS = ['aportaciones', 'resumen', 'mensual'] as const;

/** /donaciones — aportaciones, resumen por periodo y resumen mensual (F4-01 … F4-05). */
@Component({
  selector: 'app-donaciones',
  imports: [
    MatButton,
    MatTabGroup,
    MatTab,
    MatTabContent,
    LucideAngularModule,
    PuedeDirective,
    PageHeader,
    AportacionesTab,
    ResumenIngresosTab,
    ResumenMensualTab,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      titulo="Donaciones"
      descripcion="Aportaciones económicas, ingresos por periodo y resumen mensual."
    >
      <button
        *appPuede="'donaciones:crear'"
        matButton="filled"
        type="button"
        (click)="abrirFormulario()"
      >
        <lucide-icon [img]="iconos.Plus" [size]="16" aria-hidden="true" /> Registrar aportación
      </button>
    </app-page-header>

    <mat-tab-group
      animationDuration="0ms"
      [selectedIndex]="indice()"
      (selectedIndexChange)="cambiarPestana($event)"
    >
      <mat-tab label="Aportaciones">
        <ng-template matTabContent>
          <div class="pestana">
            <app-aportaciones-tab (ver)="ver($event)" (registrar)="abrirFormulario()" />
          </div>
        </ng-template>
      </mat-tab>
      <mat-tab label="Resumen">
        <ng-template matTabContent>
          <div class="pestana"><app-resumen-ingresos-tab /></div>
        </ng-template>
      </mat-tab>
      <mat-tab label="Resumen mensual">
        <ng-template matTabContent>
          <div class="pestana"><app-resumen-mensual-tab /></div>
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
export class DonacionesPage {
  private readonly servicio = inject(DonacionesService);
  private readonly dialogo = inject(MatDialog);
  private readonly confirmar = inject(ConfirmarService);
  private readonly notificar = inject(NotificarService);

  protected readonly filtros = filtrosURL({ tab: 'aportaciones' });
  protected readonly iconos = { Plus };
  protected readonly indice = computed(() => {
    const i = PESTANAS.indexOf(this.filtros.valores().tab as (typeof PESTANAS)[number]);
    return i < 0 ? 0 : i;
  });

  protected cambiarPestana(indice: number) {
    const tab = PESTANAS[indice] ?? 'aportaciones';
    if (tab !== this.filtros.valores().tab) this.filtros.cambiar({ tab });
  }

  protected abrirFormulario(donacion?: Donacion) {
    this.dialogo.open<DonacionFormDialogo, Donacion | undefined, boolean>(DonacionFormDialogo, {
      data: donacion,
      width: '42rem',
      maxWidth: 'calc(100vw - 32px)',
    });
    // Las listas y resúmenes se recargan solos con DonacionesService.version
  }

  protected ver(id: string) {
    this.dialogo
      .open<DonacionDetalleDialogo, string, AccionDetalle | undefined>(DonacionDetalleDialogo, {
        data: id,
        width: '36rem',
        maxWidth: 'calc(100vw - 32px)',
      })
      .afterClosed()
      .subscribe((resultado) => {
        if (resultado?.accion === 'editar') this.abrirFormulario(resultado.donacion);
        if (resultado?.accion === 'anular') void this.anular(resultado.donacion);
      });
  }

  private async anular(donacion: Donacion) {
    const ok = await this.confirmar.abrir({
      titulo: 'Anular aportación',
      descripcion: `La aportación de ${nombreDonante(donacion)} dejará de sumar en los totales. No se borra: queda registrada con su motivo.`,
      textoConfirmar: 'Anular',
      peligro: true,
      motivo: 'obligatorio',
      alConfirmar: (motivo) => this.servicio.anular(donacion.id, motivo ?? ''),
    });
    if (ok) this.notificar.exito('Aportación anulada');
  }
}
