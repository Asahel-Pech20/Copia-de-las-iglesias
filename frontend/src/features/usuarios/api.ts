import { api } from '@/lib/api';
import type { RespuestaLista, RespuestaObjeto, Rol } from '@/types/comunes';
import type {
  CrearUsuario,
  EditarUsuario,
  OpcionUsuario,
  QueryUsuarios,
  Usuario,
} from '@/types/usuarios';

export async function listarUsuarios(query: QueryUsuarios) {
  const res = await api.get<RespuestaLista<Usuario>>('/usuarios', { params: query });
  return res.data;
}

export async function crearUsuario(datos: CrearUsuario) {
  const res = await api.post<RespuestaObjeto<Usuario>>('/usuarios', datos);
  return res.data.data;
}

export async function editarUsuario(id: string, datos: EditarUsuario) {
  const res = await api.patch<RespuestaObjeto<Usuario>>(`/usuarios/${id}`, datos);
  return res.data.data;
}

export async function cambiarEstadoUsuario(id: string, activo: boolean) {
  const res = await api.patch<RespuestaObjeto<Usuario>>(`/usuarios/${id}/estado`, { activo });
  return res.data.data;
}

export async function reenviarInvitacion(id: string) {
  await api.post(`/usuarios/${id}/reenviar-invitacion`);
}

/** GET /usuarios/opciones — para elegir coordinadores (F2) */
export async function listarOpcionesUsuario(rol?: Rol) {
  const res = await api.get<RespuestaObjeto<OpcionUsuario[]>>('/usuarios/opciones', {
    params: { rol },
  });
  return res.data.data;
}
