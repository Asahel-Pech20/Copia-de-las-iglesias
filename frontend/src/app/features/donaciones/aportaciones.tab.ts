import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { endOfMonth, format, startOfMonth, startOfYear, subMonths } from 'date-fns';
import { Coins, Eye, LucideAngularModule } from 'lucide-angular';
import { BadgeEstado } from '@/app/compartido/badge-estado';
import { EstadoError, EstadoVacio, Esqueleto } from '@/app/compartido/estados';
import { Paginacion } from '@/app/compartido/paginacion';
import { filtrosURL } from '@/app/core/filtros-url';
import {
  ETIQUETAS_CONCEPTO,
  ETIQUETAS_METODO,
  formatearFecha,
  opcionesDe,
} from '@/app/core/formato';
import { FormatoMonedaService } from '@/app/core/formato-moneda.service';
import { PuedeDirective } from '@/app/core/puede.directive';
import { valorDe } from '@/app/core/recurso';
import { SelectorMiembros } from '@/app/features/miembros/selector-miembros';
import { BotonExportar } from '@/app/features/reportes/boton-exportar';
import type { Donacion, QueryDonaciones } from '@/app/tipos/donaciones';
import { DonacionesService } from './donaciones.service';
import { conceptoDe, nombreDonante } from './formato-donacion';

const fechaApi = (d: Date) => format(d, 'yyyy-MM-dd');

/** Listado de aportaciones con filtros en la URL y total del filtro (F4-01). */
@Component({
  selector: 'app-aportaciones-tab',
  imports: [
    MatTableModule,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    LucideAngularModule,
    PuedeDirective,
    BadgeEstado,
    EstadoError,
    EstadoVacio,
    Esqueleto,
    Paginacion,
    SelectorMiembros,
    BotonExportar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aportaciones.tab.html',
  styleUrl: './aportaciones.tab.css',
})
export class AportacionesTab {
  readonly ver = output<string>();
  readonly registrar = output();

  private readonly servicio = inject(DonacionesService);
  protected readonly moneda = inject(FormatoMonedaService);

  protected readonly filtros = filtrosURL({
    desde: '',
    hasta: '',
    concepto: '',
    metodo: '',
    miembroId: '',
    anonimas: false as boolean,
    anuladas: false as boolean,
    page: 1,
  });

  /** Sin rango en la URL, el mes en curso */
  protected readonly rango = computed(() => {
    const f = this.filtros.valores();
    const hoy = new Date();
    return !f.desde && !f.hasta
      ? { desde: fechaApi(startOfMonth(hoy)), hasta: fechaApi(hoy) }
      : { desde: f.desde || undefined, hasta: f.hasta || undefined };
  });

  protected readonly consulta = rxResource({
    params: () => {
      const f = this.filtros.valores();
      const query: QueryDonaciones & { version: number } = {
        desde: this.rango().desde,
        hasta: this.rango().hasta,
        concepto: (f.concepto || undefined) as Donacion['concepto'] | undefined,
        metodo: (f.metodo || undefined) as Donacion['metodo'] | undefined,
        miembroId: f.miembroId || undefined,
        anonima: f.anonimas ? true : undefined,
        incluirAnuladas: f.anuladas ? true : undefined,
        page: f.page,
        limit: 20,
        version: this.servicio.version(),
      };
      return query;
    },
    stream: ({ params: { version: _version, ...query } }) => this.servicio.listar(query),
  });

  protected readonly datos = computed(() => valorDe(this.consulta)?.data ?? []);
  protected readonly miembroSeleccion = computed(() =>
    this.filtros.valores().miembroId ? [this.filtros.valores().miembroId] : [],
  );
  protected readonly filtrosReporte = computed(() => ({
    desde: this.rango().desde,
    hasta: this.rango().hasta,
  }));
  protected readonly presets = computed(() => {
    const hoy = new Date();
    return [
      { etiqueta: 'Este mes', desde: fechaApi(startOfMonth(hoy)), hasta: fechaApi(hoy) },
      {
        etiqueta: 'Mes anterior',
        desde: fechaApi(startOfMonth(subMonths(hoy, 1))),
        hasta: fechaApi(endOfMonth(subMonths(hoy, 1))),
      },
      { etiqueta: 'Este año', desde: fechaApi(startOfYear(hoy)), hasta: fechaApi(hoy) },
    ];
  });

  protected readonly columnas = [
    'fecha',
    'donante',
    'concepto',
    'metodo',
    'monto',
    'estado',
    'acciones',
  ];
  protected readonly opcionesConcepto = opcionesDe(ETIQUETAS_CONCEPTO);
  protected readonly opcionesMetodo = opcionesDe(ETIQUETAS_METODO);
  protected readonly iconos = { Coins, Eye };
  protected readonly fecha = formatearFecha;
  protected readonly donante = nombreDonante;
  protected readonly concepto = conceptoDe;

  protected metodo(d: Donacion) {
    return ETIQUETAS_METODO[d.metodo];
  }

  protected cambiarFecha(campo: 'desde' | 'hasta', evento: Event) {
    // Al elegir una fecha se fija el rango completo visible (evita mezclar con el mes por defecto)
    const valor = (evento.target as HTMLInputElement).value;
    this.filtros.cambiar({
      desde: this.rango().desde ?? '',
      hasta: this.rango().hasta ?? '',
      [campo]: valor,
    });
  }
}
