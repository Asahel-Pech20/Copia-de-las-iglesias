import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { RouterLink } from '@angular/router';
import {
  addMonths,
  addWeeks,
  format,
  isSameMonth,
  isSameWeek,
  startOfMonth,
  subMonths,
  subWeeks,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, LucideAngularModule, Plus } from 'lucide-angular';
import { EstadoError } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import { filtrosURL } from '@/app/core/filtros-url';
import { ETIQUETAS_CATEGORIA_EVENTO, ETIQUETAS_TIPO_EVENTO, opcionesDe } from '@/app/core/formato';
import { valorDe } from '@/app/core/recurso';
import { SesionService } from '@/app/core/sesion.service';
import { MinisteriosService } from '@/app/features/ministerios/ministerios.service';
import type { CategoriaEvento, TipoEvento } from '@/app/tipos/eventos';
import { CalendarioEventos, rangoDeVista, type VistaCalendario } from './calendario-eventos';
import { LeyendaCategorias } from './componentes';
import { EventosService } from './eventos.service';

/** En móvil (< 768 px) la vista por defecto es Lista (F3-01). */
function vistaInicial(): VistaCalendario {
  return typeof matchMedia === 'function' && matchMedia('(max-width: 767px)').matches
    ? 'lista'
    : 'mes';
}

/** /eventos — calendario mes / semana / lista con filtros en la URL (F3-01). */
@Component({
  selector: 'app-eventos',
  imports: [
    RouterLink,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatSlideToggle,
    MatButtonToggleGroup,
    MatButtonToggle,
    LucideAngularModule,
    PageHeader,
    EstadoError,
    CalendarioEventos,
    LeyendaCategorias,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eventos.page.html',
  styleUrl: './eventos.page.css',
})
export class EventosPage {
  private readonly servicio = inject(EventosService);
  private readonly ministeriosService = inject(MinisteriosService);
  private readonly sesion = inject(SesionService);

  protected readonly filtros = filtrosURL({
    tipo: '',
    categoria: '',
    ministerioId: '',
    cancelados: true as boolean,
  });
  protected readonly vista = signal<VistaCalendario>(vistaInicial());
  protected readonly referencia = signal(new Date());

  protected readonly puedeCrear = computed(() =>
    this.sesion.puede('eventos:crear', 'eventos:crear-propio'),
  );
  protected readonly rango = computed(() => rangoDeVista(this.vista(), this.referencia()));

  protected readonly consulta = rxResource({
    params: () => {
      const f = this.filtros.valores();
      const { desde, hasta } = this.rango();
      return {
        desde: desde.toISOString(),
        hasta: new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate() + 1).toISOString(),
        tipo: (f.tipo || undefined) as TipoEvento | undefined,
        categoria: (f.categoria || undefined) as CategoriaEvento | undefined,
        ministerioId: f.ministerioId || undefined,
      };
    },
    stream: ({ params }) => this.servicio.listar(params),
  });
  protected readonly ministerios = rxResource({
    stream: () => this.ministeriosService.listar({ limit: 100 }),
  });
  protected readonly opcionesMinisterio = computed(() => valorDe(this.ministerios)?.data ?? []);
  protected readonly eventos = computed(() =>
    (valorDe(this.consulta)?.data ?? []).filter(
      (e) => this.filtros.valores().cancelados || e.estado !== 'CANCELADO',
    ),
  );

  protected readonly titulo = computed(() => {
    const ref = this.referencia();
    if (this.vista() === 'semana') {
      const { desde, hasta } = this.rango();
      return `${format(desde, "d 'de' MMM", { locale: es })} – ${format(hasta, "d 'de' MMM yyyy", { locale: es })}`;
    }
    const texto = format(ref, "MMMM 'de' yyyy", { locale: es });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });
  protected readonly esHoy = computed(() =>
    this.vista() === 'semana'
      ? isSameWeek(this.referencia(), new Date(), { weekStartsOn: 1 })
      : isSameMonth(this.referencia(), new Date()),
  );

  protected readonly opcionesTipo = opcionesDe(ETIQUETAS_TIPO_EVENTO);
  protected readonly opcionesCategoria = opcionesDe(ETIQUETAS_CATEGORIA_EVENTO);
  protected readonly iconos = { Plus, ChevronLeft, ChevronRight };

  protected mover(direccion: 1 | -1) {
    this.referencia.update((r) => {
      if (this.vista() === 'semana') return direccion === 1 ? addWeeks(r, 1) : subWeeks(r, 1);
      return startOfMonth(direccion === 1 ? addMonths(r, 1) : subMonths(r, 1));
    });
  }

  protected hoy() {
    this.referencia.set(new Date());
  }

  protected cambiarVista(vista: VistaCalendario) {
    this.vista.set(vista);
  }

  /** "+N más" de la vista de mes: abre la semana de ese día */
  protected verDia(dia: Date) {
    this.referencia.set(dia);
    this.vista.set('semana');
  }
}
