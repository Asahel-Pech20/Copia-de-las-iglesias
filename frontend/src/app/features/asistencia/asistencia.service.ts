import { inject, Injectable } from '@angular/core';
import { Api } from '@/app/core/api';
import type {
  AsistenciaHistorial,
  ListaAsistencia,
  QueryAsistencias,
  QueryResumenAsistencia,
  RegistrarAsistencia,
  ResumenAsistencia,
} from '@/app/tipos/asistencia';

/**
 * Servicio de asistencia (F3). F2 lo usa en el perfil del miembro:
 * `listar({ miembroId })` para el historial.
 */
@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly api = inject(Api);

  /** Pase de lista de un evento (miembros esperados + estado). */
  obtenerLista(eventoId: string) {
    return this.api.objeto<ListaAsistencia>(`/eventos/${eventoId}/asistencia`);
  }

  registrar(eventoId: string, datos: RegistrarAsistencia) {
    return this.api.put<ListaAsistencia>(`/eventos/${eventoId}/asistencia`, datos);
  }

  listar(query: QueryAsistencias) {
    return this.api.lista<AsistenciaHistorial>('/asistencias', { ...query });
  }

  resumen(query: QueryResumenAsistencia) {
    return this.api.objeto<ResumenAsistencia[]>('/asistencias/resumen', { ...query });
  }
}
