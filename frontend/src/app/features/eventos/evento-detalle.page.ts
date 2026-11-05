import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  Ban,
  ClipboardCheck,
  LucideAngularModule,
  MapPin,
  Pencil,
  UsersRound,
} from 'lucide-angular';
import { ConfirmarService } from '@/app/compartido/confirmar-dialogo';
import { EstadoError, Esqueleto } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import {
  ETIQUETAS_CATEGORIA_EVENTO,
  ETIQUETAS_TIPO_EVENTO,
  formatearFechaHora,
  formatearFechaLarga,
} from '@/app/core/formato';
import { NotificarService } from '@/app/core/notificar.service';
import type { EventoDetalle } from '@/app/tipos/eventos';
import { BadgeEstadoEvento } from './componentes';
import { EventosService } from './eventos.service';
import { ICONO_CATEGORIA } from './estilos';
import { PermisosMinisterioService } from './permisos-ministerio.service';
import { ResponsablesDialogo } from './responsables.dialogo';

/** /eventos/:id — datos, responsables, resumen de asistencia y acciones según permisos y estado (F3-03). */
@Component({
  selector: 'app-evento-detalle',
  imports: [
    RouterLink,
    MatButton,
    LucideAngularModule,
    PageHeader,
    EstadoError,
    Esqueleto,
    BadgeEstadoEvento,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evento-detalle.page.html',
  styleUrl: './evento-detalle.page.css',
})
export class EventoDetallePage {
  /** Parámetro :id de la ruta */
  readonly id = input.required<string>();
  private readonly servicio = inject(EventosService);
  private readonly permisos = inject(PermisosMinisterioService);
  private readonly confirmar = inject(ConfirmarService);
  private readonly notificar = inject(NotificarService);
  private readonly dialogo = inject(MatDialog);

  protected readonly consulta = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.servicio.obtener(params),
  });

  protected readonly iconos = {
    ArrowLeft,
    Ban,
    ClipboardCheck,
    MapPin,
    Pencil,
    UsersRound,
  };
  protected readonly iconoCategoria = ICONO_CATEGORIA;
  protected readonly categorias = ETIQUETAS_CATEGORIA_EVENTO;
  protected readonly tipos = ETIQUETAS_TIPO_EVENTO;
  protected readonly fechaHora = formatearFechaHora;
  protected readonly fechaLarga = formatearFechaLarga;

  protected puedeEditar(e: EventoDetalle) {
    return this.permisos.puede('eventos:editar', 'eventos:editar-propio', e.ministerio?.id);
  }

  protected puedeCancelar(e: EventoDetalle) {
    return this.permisos.puede('eventos:eliminar', 'eventos:eliminar-propio', e.ministerio?.id);
  }

  protected puedeAsistencia(e: EventoDetalle) {
    return this.permisos.puede('asistencia:leer', 'asistencia:leer-propio', e.ministerio?.id);
  }

  protected async cancelar(evento: EventoDetalle) {
    const ok = await this.confirmar.abrir({
      titulo: 'Cancelar evento',
      descripcion:
        'El evento quedará como cancelado (no se borra) y no se podrá pasar lista. La asistencia ya registrada se conserva.',
      textoConfirmar: 'Cancelar evento',
      peligro: true,
      motivo: 'obligatorio',
      alConfirmar: (motivo) => this.servicio.cancelar(evento.id, motivo ?? ''),
    });
    if (ok) {
      this.notificar.exito('Evento cancelado');
      this.consulta.reload();
    }
  }

  protected editarResponsables(evento: EventoDetalle) {
    this.dialogo
      .open<ResponsablesDialogo, EventoDetalle, boolean>(ResponsablesDialogo, {
        data: evento,
        width: '32rem',
        maxWidth: 'calc(100vw - 32px)',
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) this.consulta.reload();
      });
  }
}
