import { api } from '@/lib/api';
import type { RespuestaLista, RespuestaObjeto } from '@/types/comunes';
import type {
  CrearMinisterio,
  EditarMinisterio,
  Integrante,
  Ministerio,
  QueryIntegrantes,
  QueryMinisterios,
} from '@/types/ministerios';

export async function listarMinisterios(query: QueryMinisterios) {
  const res = await api.get<RespuestaLista<Ministerio>>('/ministerios', { params: query });
  return res.data;
}

export async function obtenerMinisterio(id: string) {
  const res = await api.get<RespuestaObjeto<Ministerio>>(`/ministerios/${id}`);
  return res.data.data;
}

export async function crearMinisterio(datos: CrearMinisterio) {
  const res = await api.post<RespuestaObjeto<Ministerio>>('/ministerios', datos);
  return res.data.data;
}

export async function editarMinisterio(id: string, datos: EditarMinisterio) {
  const res = await api.patch<RespuestaObjeto<Ministerio>>(`/ministerios/${id}`, datos);
  return res.data.data;
}

export async function cambiarEstadoMinisterio(id: string, activo: boolean) {
  const res = await api.patch<RespuestaObjeto<Ministerio>>(`/ministerios/${id}/estado`, {
    activo,
  });
  return res.data.data;
}

export async function asignarCoordinadores(id: string, usuarioIds: string[]) {
  const res = await api.put<RespuestaObjeto<Ministerio>>(`/ministerios/${id}/coordinadores`, {
    usuarioIds,
  });
  return res.data.data;
}

export async function listarIntegrantes(id: string, query: QueryIntegrantes) {
  const res = await api.get<RespuestaLista<Integrante>>(`/ministerios/${id}/miembros`, {
    params: query,
  });
  return res.data;
}

export async function vincularMiembros(id: string, miembroIds: string[]) {
  const res = await api.post<RespuestaObjeto<Ministerio>>(`/ministerios/${id}/miembros`, {
    miembroIds,
  });
  return res.data.data;
}

export async function desvincularMiembro(id: string, miembroId: string) {
  await api.delete(`/ministerios/${id}/miembros/${miembroId}`);
}
