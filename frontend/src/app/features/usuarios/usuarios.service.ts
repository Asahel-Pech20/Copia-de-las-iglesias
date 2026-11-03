import { inject, Injectable } from '@angular/core';
import { Api } from '@/app/core/api';
import type { Rol } from '@/app/tipos/comunes';
import type {
  CrearUsuario,
  EditarUsuario,
  OpcionUsuario,
  QueryUsuarios,
  Usuario,
} from '@/app/tipos/usuarios';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly api = inject(Api);

  listar(query: QueryUsuarios) {
    return this.api.lista<Usuario>('/usuarios', { ...query });
  }

  guardar(datos: CrearUsuario | EditarUsuario, id?: string) {
    return id
      ? this.api.patch<Usuario>(`/usuarios/${id}`, datos)
      : this.api.post<Usuario>('/usuarios', datos);
  }

  cambiarEstado(id: string, activo: boolean) {
    return this.api.patch<Usuario>(`/usuarios/${id}/estado`, { activo });
  }

  reenviarInvitacion(id: string) {
    return this.api.post<void>(`/usuarios/${id}/reenviar-invitacion`);
  }

  /** GET /usuarios/opciones — usuarios activos para elegir coordinadores (F2) */
  opciones(rol?: Rol) {
    return this.api.objeto<OpcionUsuario[]>('/usuarios/opciones', { rol });
  }
}
