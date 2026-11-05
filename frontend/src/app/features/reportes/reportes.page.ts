import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { format, startOfYear } from 'date-fns';
import {
  ArrowLeft,
  Banknote,
  CalendarCheck,
  LucideAngularModule,
  type LucideIconData,
  Network,
  Users,
} from 'lucide-angular';
import { EstadoVacio } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import { filtrosURL } from '@/app/core/filtros-url';
import { ETIQUETAS_AGRUPACION, formatearFechaHora, opcionesDe } from '@/app/core/formato';
import { valorDe } from '@/app/core/recurso';
import { SesionService } from '@/app/core/sesion.service';
import { EventosService } from '@/app/features/eventos/eventos.service';
import { MinisteriosService } from '@/app/features/ministerios/ministerios.service';
import type { AgrupacionIngresos } from '@/app/tipos/donaciones';
import type { FiltrosReporte, TipoReporte } from '@/app/tipos/reportes';
import { BotonExportar } from './boton-exportar';
import { permisosDeReporte } from './permisos';
import { ReportesService } from './reportes.service';
import { VistaPreviaReporte } from './vista-previa-reporte';

interface InfoReporte {
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  icono: LucideIconData;
}

const REPORTES: InfoReporte[] = [
  {
    tipo: 'miembros',
    titulo: 'Miembros',
    descripcion: 'Listado general de la congregación con sus ministerios.',
    icono: Users,
  },
  {
    tipo: 'asistencia',
    titulo: 'Asistencia',
    descripcion: 'Por evento o resumen semanal y mensual de un periodo.',
    icono: CalendarCheck,
  },
  {
    tipo: 'ministerios',
    titulo: 'Ministerios',
    descripcion: 'Participación e integrantes de cada ministerio.',
    icono: Network,
  },
  {
    tipo: 'ingresos',
    titulo: 'Ingresos',
    descripcion: 'Aportaciones por periodo, concepto o método de recepción.',
    icono: Banknote,
  },
];

const esTipo = (valor: string): valor is TipoReporte => REPORTES.some((r) => r.tipo === valor);

/** /reportes — tarjetas por reporte (según permisos) y, con ?tipo=, filtros + vista previa + descarga. */
@Component({
  selector: 'app-reportes',
  imports: [
    RouterLink,
    NgTemplateOutlet,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    LucideAngularModule,
    PageHeader,
    EstadoVacio,
    BotonExportar,
    VistaPreviaReporte,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reportes.page.html',
  styleUrl: './reportes.page.css',
})
export class ReportesPage {
  private readonly sesion = inject(SesionService);
  private readonly servicio = inject(ReportesService);
  private readonly eventosService = inject(EventosService);
  private readonly ministeriosService = inject(MinisteriosService);

  protected readonly url = filtrosURL({
    tipo: '',
    estado: 'activo',
    modo: '',
    eventoId: '',
    periodo: 'semanal',
    desde: '',
    hasta: '',
    ministerioId: '',
    agrupar: 'mes',
  });

  protected readonly permitidos = computed(() =>
    REPORTES.filter((r) => this.sesion.puede(...permisosDeReporte(r.tipo))),
  );
  protected readonly pedido = computed(() => {
    const tipo = this.url.valores().tipo;
    return esTipo(tipo) ? REPORTES.find((r) => r.tipo === tipo) : undefined;
  });
  protected readonly info = computed(() => {
    const pedido = this.pedido();
    return pedido && this.permitidos().includes(pedido) ? pedido : undefined;
  });

  protected readonly modoAsistencia = computed(() => {
    const u = this.url.valores();
    return u.modo || (u.eventoId ? 'evento' : 'periodo');
  });

  /** Filtros efectivos: son exactamente los que usan la vista previa y la descarga (F4-10) */
  protected readonly filtros = computed<FiltrosReporte>(() => {
    const u = this.url.valores();
    const rango = { desde: u.desde || undefined, hasta: u.hasta || undefined };
    switch (this.info()?.tipo) {
      case 'miembros':
        return { estado: u.estado as FiltrosReporte['estado'] };
      case 'asistencia':
        return this.modoAsistencia() === 'evento'
          ? { eventoId: u.eventoId || undefined }
          : { periodo: u.periodo as FiltrosReporte['periodo'], ...rango };
      case 'ministerios':
        return { ministerioId: u.ministerioId || undefined, ...rango };
      case 'ingresos': {
        const sinRango = !u.desde && !u.hasta;
        return {
          agrupar: u.agrupar as AgrupacionIngresos,
          desde: sinRango ? format(startOfYear(new Date()), 'yyyy-MM-dd') : rango.desde,
          hasta: sinRango ? format(new Date(), 'yyyy-MM-dd') : rango.hasta,
        };
      }
      default:
        return {};
    }
  });

  /** Asistencia por evento sin evento elegido: no hay nada que consultar todavía */
  protected readonly falta = computed(
    () =>
      this.info()?.tipo === 'asistencia' &&
      this.modoAsistencia() === 'evento' &&
      !this.filtros().eventoId,
  );

  protected readonly consulta = rxResource({
    params: () => {
      const info = this.info();
      return info && !this.falta() ? { tipo: info.tipo, filtros: this.filtros() } : undefined;
    },
    stream: ({ params }) => this.servicio.vistaPrevia(params.tipo, params.filtros),
  });

  private readonly eventos = rxResource({
    params: () => (this.info()?.tipo === 'asistencia' ? true : undefined),
    stream: () => this.eventosService.listar({ limit: 100 }),
  });
  private readonly ministerios = rxResource({
    params: () => (this.info()?.tipo === 'ministerios' ? true : undefined),
    stream: () => this.ministeriosService.listar({ limit: 100 }),
  });
  protected readonly opcionesEvento = computed(() => valorDe(this.eventos)?.data ?? []);
  protected readonly opcionesMinisterio = computed(() => valorDe(this.ministerios)?.data ?? []);

  protected readonly opcionesAgrupar = opcionesDe(ETIQUETAS_AGRUPACION);
  protected readonly iconoVolver = ArrowLeft;
  protected readonly fechaHora = formatearFechaHora;

  protected fecha(campo: 'desde' | 'hasta', evento: Event) {
    this.url.cambiar({ [campo]: (evento.target as HTMLInputElement).value });
  }
}
