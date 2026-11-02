import { api } from '@/lib/api';
import type {
  AsistenciaHistorial,
  ListaAsistencia,
  QueryAsistencias,
  QueryResumenAsistencia,
  RegistrarAsistencia,
  ResumenAsistencia,
} from '@/types/asistencia';
import type { RespuestaLista, RespuestaObjeto } from '@/types/comunes';

export async function obtenerLista(eventoId: string) {
  const res = await api.get<RespuestaObjeto<ListaAsistencia>>(`/eventos/${eventoId}/asistencia`);
  return res.data.data;
}

export async function registrarAsistencia(eventoId: string, datos: RegistrarAsistencia) {
  const res = await api.put<RespuestaObjeto<ListaAsistencia>>(
    `/eventos/${eventoId}/asistencia`,
    datos,
  );
  return res.data.data;
}

export async function listarAsistencias(query: QueryAsistencias) {
  const res = await api.get<RespuestaLista<AsistenciaHistorial>>('/asistencias', {
    params: query,
  });
  return res.data;
}

export async function resumenAsistencia(query: QueryResumenAsistencia) {
  const res = await api.get<RespuestaObjeto<ResumenAsistencia[]>>('/asistencias/resumen', {
    params: query,
  });
  return res.data.data;
}
