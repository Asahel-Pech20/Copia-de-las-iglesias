import { api } from '@/lib/api';
import type { RespuestaLista, RespuestaObjeto } from '@/types/comunes';
import type {
  CambiarEstadoMiembro,
  CrearMiembro,
  EditarMiembro,
  Miembro,
  MiembroDetalle,
  MiembroLista,
  MetaPosibleDuplicado,
  QueryMiembros,
} from '@/types/miembros';

export async function listarMiembros(query: QueryMiembros) {
  const res = await api.get<RespuestaLista<MiembroLista>>('/miembros', { params: query });
  return res.data;
}

export async function obtenerMiembro(id: string) {
  const res = await api.get<RespuestaObjeto<MiembroDetalle>>(`/miembros/${id}`);
  return res.data.data;
}

/** Devuelve también `meta.posibleDuplicado` si ya existe alguien con el mismo nombre. */
export async function crearMiembro(datos: CrearMiembro) {
  const res = await api.post<RespuestaObjeto<Miembro> & { meta?: MetaPosibleDuplicado }>(
    '/miembros',
    datos,
  );
  return res.data;
}

export async function editarMiembro(id: string, datos: EditarMiembro) {
  const res = await api.patch<RespuestaObjeto<Miembro>>(`/miembros/${id}`, datos);
  return res.data.data;
}

export async function cambiarEstadoMiembro(id: string, datos: CambiarEstadoMiembro) {
  const res = await api.patch<RespuestaObjeto<Miembro>>(`/miembros/${id}/estado`, datos);
  return res.data.data;
}
