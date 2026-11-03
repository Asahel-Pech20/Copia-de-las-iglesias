import { inject, Injectable } from '@angular/core';
import { Api } from '@/app/core/api';
import type {
  CambiarEstadoMiembro,
  CrearMiembro,
  EditarMiembro,
  MetaPosibleDuplicado,
  Miembro,
  MiembroDetalle,
  MiembroLista,
  QueryMiembros,
} from '@/app/tipos/miembros';

/** Servicio de miembros (F2). Lo reutilizan F3/F4 a través de SelectorMiembros. */
@Injectable({ providedIn: 'root' })
export class MiembrosService {
  private readonly api = inject(Api);

  listar(query: QueryMiembros) {
    return this.api.lista<MiembroLista>('/miembros', { ...query });
  }

  obtener(id: string) {
    return this.api.objeto<MiembroDetalle>(`/miembros/${id}`);
  }

  /** Devuelve también `meta.posibleDuplicado` si ya existe alguien con el mismo nombre. */
  crear(datos: CrearMiembro) {
    return this.api.postConMeta<Miembro, MetaPosibleDuplicado>('/miembros', datos);
  }

  editar(id: string, datos: EditarMiembro) {
    return this.api.patch<Miembro>(`/miembros/${id}`, datos);
  }

  cambiarEstado(id: string, datos: CambiarEstadoMiembro) {
    return this.api.patch<Miembro>(`/miembros/${id}/estado`, datos);
  }
}
