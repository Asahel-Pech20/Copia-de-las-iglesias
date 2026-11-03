import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { SesionService } from '@/app/core/sesion.service';
import { EstadoError, Esqueleto } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import { CargaLogo } from './carga-logo';
import { ConfiguracionService } from './configuracion.service';
import { FormGeneral } from './form-general';
import { Horarios } from './horarios';

@Component({
  selector: 'app-configuracion',
  imports: [
    MatTabGroup,
    MatTab,
    PageHeader,
    EstadoError,
    Esqueleto,
    FormGeneral,
    CargaLogo,
    Horarios,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      titulo="Configuración de la iglesia"
      [descripcion]="editable() ? undefined : 'Solo el administrador puede modificar estos datos.'"
    />
    @if (consulta.isLoading() && !consulta.hasValue()) {
      <app-esqueleto [filas]="4" [columnas]="2" />
    } @else if (consulta.error()) {
      <app-estado-error [error]="consulta.error()" (reintentar)="consulta.reload()" />
    } @else if (consulta.value(); as config) {
      <mat-tab-group animationDuration="0ms" mat-stretch-tabs="false">
        <mat-tab label="General">
          <section class="tarjeta tarjeta-cuerpo pestana">
            <app-form-general [config]="config" [editable]="editable()" />
          </section>
        </mat-tab>
        <mat-tab label="Logotipo">
          <section class="tarjeta tarjeta-cuerpo pestana">
            <app-carga-logo [config]="servicio.actual() ?? config" [editable]="editable()" />
          </section>
        </mat-tab>
        <mat-tab label="Horarios">
          <div class="pestana"><app-horarios [editable]="editable()" /></div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    .pestana {
      margin-top: 16px;
    }
  `,
})
export class ConfiguracionPage {
  protected readonly servicio = inject(ConfiguracionService);
  private readonly sesion = inject(SesionService);
  protected readonly editable = computed(() => this.sesion.puede('configuracion:editar'));
  protected readonly consulta = rxResource({ stream: () => this.servicio.obtener() });
}
