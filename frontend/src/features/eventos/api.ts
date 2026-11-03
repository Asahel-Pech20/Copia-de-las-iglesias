import { api } from '@/lib/api';
import type { RespuestaLista, RespuestaObjeto } from '@/types/comunes';
import type { Evento, EventoDetalle, GuardarEvento, QueryEventos } from '@/types/eventos';

export async function listarEventos(query: QueryEventos) {
  const res = await api.get<RespuestaLista<Evento>>('/eventos', { params: query });
  return res.data;
}

export async function eventosProximos(limit: number) {
  const res = await api.get<RespuestaObjeto<Evento[]>>('/eventos/proximos', { params: { limit } });
  return res.data.data;
}

export async function obtenerEvento(id: string) {
  const res = await api.get<RespuestaObjeto<EventoDetalle>>(`/eventos/${id}`);
  return res.data.data;
}

export async function crearEvento(datos: GuardarEvento) {
  const res = await api.post<RespuestaObjeto<EventoDetalle>>('/eventos', datos);
  return res.data.data;
}

export async function editarEvento(id: string, datos: Partial<GuardarEvento>) {
  const res = await api.patch<RespuestaObjeto<EventoDetalle>>(`/eventos/${id}`, datos);
  return res.data.data;
}

export async function cancelarEvento(id: string, motivo: string) {
  const res = await api.patch<RespuestaObjeto<EventoDetalle>>(`/eventos/${id}/cancelar`, {
    motivo,
  });
  return res.data.data;
}

export async function asignarResponsables(id: string, miembroIds: string[]) {
  const res = await api.put<RespuestaObjeto<EventoDetalle>>(`/eventos/${id}/responsables`, {
    miembroIds,
  });
  return res.data.data;
}
