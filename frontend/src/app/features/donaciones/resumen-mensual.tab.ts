import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { format } from 'date-fns';
import { FileText, LucideAngularModule, Minus, TrendingDown, TrendingUp } from 'lucide-angular';
import { EstadoError, Esqueleto } from '@/app/compartido/estados';
import { filtrosURL } from '@/app/core/filtros-url';
import { etiquetaClave, formatearMes } from '@/app/core/formato';
import { FormatoMonedaService } from '@/app/core/formato-moneda.service';
import { NotificarService } from '@/app/core/notificar.service';
import { PuedeDirective } from '@/app/core/puede.directive';
import { valorDe } from '@/app/core/recurso';
import { ReportesService } from '@/app/features/reportes/reportes.service';
import type { GrupoIngresos } from '@/app/tipos/donaciones';
import { DonacionesService } from './donaciones.service';
import { textoVariacion } from './formato-donacion';

/** Resumen mensual: total, variación contra el mes anterior y desgloses (F4-05). */
@Component({
  selector: 'app-resumen-mensual-tab',
  imports: [
    NgTemplateOutlet,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    LucideAngularModule,
    PuedeDirective,
    EstadoError,
    Esqueleto,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resumen-mensual.tab.html',
  styleUrl: './resumen-mensual.tab.css',
})
export class ResumenMensualTab {
  private readonly servicio = inject(DonacionesService);
  private readonly reportes = inject(ReportesService);
  private readonly notificar = inject(NotificarService);
  protected readonly moneda = inject(FormatoMonedaService);

  protected readonly filtros = filtrosURL({ mes: '' });
  protected readonly maxMes = format(new Date(), 'yyyy-MM');
  protected readonly valorMes = computed(() => this.filtros.valores().mes || this.maxMes);

  protected readonly consulta = rxResource({
    params: () => {
      const [anio, mes] = this.valorMes().split('-').map(Number) as [number, number];
      return { anio, mes, version: this.servicio.version() };
    },
    stream: ({ params: { version: _version, ...query } }) => this.servicio.resumenMensual(query),
  });
  protected readonly r = computed(() => valorDe(this.consulta));
  protected readonly descargando = signal(false);

  protected readonly iconos = { FileText, Minus, TrendingDown, TrendingUp };
  protected readonly mesTexto = formatearMes;
  protected readonly textoVariacion = textoVariacion;
  protected readonly etiqueta = etiquetaClave;

  protected conDatos(grupos: GrupoIngresos[]) {
    return grupos.filter((g) => g.cantidad > 0);
  }

  protected cambiarMes(evento: Event) {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) this.filtros.cambiar({ mes: valor });
  }

  protected descargarPdf() {
    const r = this.r();
    if (!r) return;
    this.descargando.set(true);
    this.reportes
      .descargar('ingresos', { desde: r.desde, hasta: r.hasta, agrupar: 'concepto' }, 'pdf')
      .subscribe({
        next: (a) => {
          this.descargando.set(false);
          this.notificar.exito(`Descargado ${a.nombre}`);
        },
        error: (e: unknown) => {
          this.descargando.set(false);
          this.notificar.error(e);
        },
      });
  }
}
