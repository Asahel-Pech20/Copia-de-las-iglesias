import { api } from '@/lib/api';
import type { RespuestaObjeto } from '@/types/comunes';
import type {
  Donacion,
  GuardarDonacion,
  QueryDonaciones,
  QueryResumenIngresos,
  RespuestaListaDonaciones,
  ResumenIngresos,
  ResumenMensual,
} from '@/types/donaciones';

export async function listarDonaciones(query: QueryDonaciones) {
  const res = await api.get<RespuestaListaDonaciones>('/donaciones', { params: query });
  return res.data;
}

export async function obtenerDonacion(id: string) {
  const res = await api.get<RespuestaObjeto<Donacion>>(`/donaciones/${id}`);
  return res.data.data;
}

export async function crearDonacion(datos: GuardarDonacion) {
  const res = await api.post<RespuestaObjeto<Donacion>>('/donaciones', datos);
  return res.data.data;
}

export async function editarDonacion(id: string, datos: Partial<GuardarDonacion>) {
  const res = await api.patch<RespuestaObjeto<Donacion>>(`/donaciones/${id}`, datos);
  return res.data.data;
}

export async function anularDonacion(id: string, motivo: string) {
  const res = await api.patch<RespuestaObjeto<Donacion>>(`/donaciones/${id}/anular`, { motivo });
  return res.data.data;
}

export async function obtenerResumenIngresos(query: QueryResumenIngresos) {
  const res = await api.get<RespuestaObjeto<ResumenIngresos>>('/donaciones/resumen', {
    params: query,
  });
  return res.data.data;
}

export async function obtenerResumenMensual(query: { anio: number; mes: number }) {
  const res = await api.get<RespuestaObjeto<ResumenMensual>>('/donaciones/resumen-mensual', {
    params: query,
  });
  return res.data.data;
}
