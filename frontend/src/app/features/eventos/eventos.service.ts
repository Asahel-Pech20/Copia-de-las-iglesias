import { inject, Injectable } from '@angular/core';
import { Api } from '@/app/core/api';
import type { Evento, EventoDetalle, GuardarEvento, QueryEventos } from '@/app/tipos/eventos';

/** Servicio de eventos (F3). Lo reutilizan el dashboard (F4) y las actividades del ministerio (F2). */
@Injectable({ providedIn: 'root' })
export class EventosService {
  private readonly api = inject(Api);

  /** Con `desde`/`hasta` devuelve el rango sin paginar (calendario); sin rango, paginado. */
  listar(query: QueryEventos) {
    return this.api.lista<Evento>('/eventos', { ...query });
  }

  proximos(limit = 5) {
    return this.api.objeto<Evento[]>('/eventos/proximos', { limit });
  }

  obtener(id: string) {
    return this.api.objeto<EventoDetalle>(`/eventos/${id}`);
  }

  crear(datos: GuardarEvento) {
    return this.api.post<EventoDetalle>('/eventos', datos);
  }

  editar(id: string, datos: Partial<GuardarEvento>) {
    return this.api.patch<EventoDetalle>(`/eventos/${id}`, datos);
  }

  cancelar(id: string, motivo: string) {
    return this.api.patch<EventoDetalle>(`/eventos/${id}/cancelar`, { motivo });
  }

  asignarResponsables(id: string, miembroIds: string[]) {
    return this.api.put<EventoDetalle>(`/eventos/${id}/responsables`, { miembroIds });
  }
}
