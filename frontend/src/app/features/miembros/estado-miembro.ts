import { inject, Injectable } from '@angular/core';
import { NotificarService } from '@/app/core/notificar.service';
import { ConfirmarService } from '@/app/compartido/confirmar-dialogo';
import type { Miembro } from '@/app/tipos/miembros';
import { MiembrosService } from './miembros.service';

/** Confirmación para desactivar (con motivo opcional) o reactivar un miembro (F2-03). */
@Injectable({ providedIn: 'root' })
export class EstadoMiembroService {
  private readonly confirmar = inject(ConfirmarService);
  private readonly servicio = inject(MiembrosService);
  private readonly notificar = inject(NotificarService);

  /** Resuelve true si el estado cambió. */
  async cambiar(miembro: Pick<Miembro, 'id' | 'nombre' | 'apellidos' | 'activo'>) {
    const desactivar = miembro.activo;
    const nombre = `${miembro.nombre} ${miembro.apellidos}`;
    const hecho = await this.confirmar.abrir({
      titulo: desactivar ? 'Desactivar miembro' : 'Reactivar miembro',
      descripcion: desactivar
        ? `${nombre} dejará de aparecer en los listados de activos y saldrá de sus ministerios. Se conservará todo su historial de asistencia y aportaciones.`
        : `${nombre} volverá a aparecer como activo. Sus ministerios anteriores no se restauran automáticamente.`,
      textoConfirmar: desactivar ? 'Desactivar' : 'Reactivar',
      peligro: desactivar,
      motivo: desactivar ? 'opcional' : 'no',
      alConfirmar: (motivo) =>
        this.servicio.cambiarEstado(miembro.id, { activo: !desactivar, motivo }),
    });
    if (hecho) this.notificar.exito(desactivar ? 'Miembro desactivado' : 'Miembro reactivado');
    return hecho;
  }
}
