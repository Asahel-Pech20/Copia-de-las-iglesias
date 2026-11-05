import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Ban, LucideAngularModule } from 'lucide-angular';
import { aFechaApi } from '@/app/core/formato';
import type { Evento } from '@/app/tipos/eventos';
import { ListaEventos } from './componentes';
import { ICONO_CATEGORIA } from './estilos';

export type VistaCalendario = 'mes' | 'semana' | 'lista';

const OPCIONES_SEMANA = { weekStartsOn: 1 as const };
const MAX_POR_DIA = 3;

/** Rango (inclusive) que muestra cada vista; es lo que se pide al backend (≤ 93 días). */
export function rangoDeVista(vista: VistaCalendario, referencia: Date) {
  if (vista === 'mes') {
    return {
      desde: startOfWeek(startOfMonth(referencia), OPCIONES_SEMANA),
      hasta: endOfWeek(endOfMonth(referencia), OPCIONES_SEMANA),
    };
  }
  if (vista === 'semana') {
    return {
      desde: startOfWeek(referencia, OPCIONES_SEMANA),
      hasta: endOfWeek(referencia, OPCIONES_SEMANA),
    };
  }
  return { desde: startOfMonth(referencia), hasta: endOfMonth(referencia) };
}

interface Dia {
  fecha: Date;
  clave: string;
  numero: string;
  hoy: boolean;
  delMes: boolean;
  eventos: Evento[];
}

/**
 * Calendario de eventos (mes / semana / lista). Reemplaza a FullCalendar de la versión en React:
 * sin dependencias nuevas, con los tokens de diseño y ícono + texto además del color (WCAG).
 */
@Component({
  selector: 'app-calendario-eventos',
  imports: [RouterLink, NgTemplateOutlet, LucideAngularModule, ListaEventos],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendario-eventos.html',
  styleUrl: './calendario-eventos.css',
})
export class CalendarioEventos {
  readonly eventos = input.required<Evento[]>();
  readonly vista = input.required<VistaCalendario>();
  readonly referencia = input.required<Date>();
  readonly puedeCrear = input(false);
  /** "+N más": pide ver ese día completo */
  readonly verDia = output<Date>();

  protected readonly iconos = ICONO_CATEGORIA;
  protected readonly iconoCancelado = Ban;
  protected readonly maxPorDia = MAX_POR_DIA;
  protected readonly nombresDias = eachDayOfInterval({
    start: startOfWeek(new Date(), OPCIONES_SEMANA),
    end: addDays(startOfWeek(new Date(), OPCIONES_SEMANA), 6),
  }).map((d) => ({
    corto: format(d, 'EEE', { locale: es }),
    largo: format(d, 'EEEE', { locale: es }),
  }));

  private readonly porDia = computed(() => {
    const mapa = new Map<string, Evento[]>();
    const ordenados = [...this.eventos()].sort((a, b) =>
      a.fechaInicio.localeCompare(b.fechaInicio),
    );
    for (const e of ordenados) {
      const clave = aFechaApi(new Date(e.fechaInicio));
      mapa.set(clave, [...(mapa.get(clave) ?? []), e]);
    }
    return mapa;
  });

  /** Días de la vista actual (en lista, solo los que tienen eventos) */
  protected readonly dias = computed<Dia[]>(() => {
    const vista = this.vista();
    const referencia = this.referencia();
    const { desde, hasta } = rangoDeVista(vista, referencia);
    return eachDayOfInterval({ start: desde, end: hasta })
      .map((fecha) => {
        const clave = aFechaApi(fecha);
        return {
          fecha,
          clave,
          numero: format(fecha, 'd'),
          hoy: isToday(fecha),
          delMes: isSameMonth(fecha, referencia),
          eventos: this.porDia().get(clave) ?? [],
        };
      })
      .filter((d) => vista !== 'lista' || d.eventos.length > 0);
  });

  protected readonly semanas = computed(() => {
    const dias = this.dias();
    return Array.from({ length: Math.ceil(dias.length / 7) }, (_, i) =>
      dias.slice(i * 7, i * 7 + 7),
    );
  });

  protected hora(e: Evento) {
    return format(new Date(e.fechaInicio), 'HH:mm');
  }

  protected tituloDia(d: Dia) {
    return format(d.fecha, "EEEE d 'de' MMMM", { locale: es });
  }

  protected icono(e: Evento) {
    return e.estado === 'CANCELADO' ? this.iconoCancelado : this.iconos[e.categoria];
  }

  protected claseEvento(e: Evento) {
    return e.estado === 'CANCELADO' ? 'cat-CANCELADO' : `cat-${e.categoria}`;
  }

  protected descripcion(e: Evento) {
    return `${this.hora(e)} ${e.titulo}${e.estado === 'CANCELADO' ? ' (cancelado)' : ''}`;
  }
}
