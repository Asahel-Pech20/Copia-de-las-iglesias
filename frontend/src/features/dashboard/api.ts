import { api } from '@/lib/api';
import type { RespuestaObjeto } from '@/types/comunes';
import type { Dashboard } from '@/types/dashboard';

export async function obtenerDashboard() {
  const res = await api.get<RespuestaObjeto<Dashboard>>('/dashboard');
  return res.data.data;
}
