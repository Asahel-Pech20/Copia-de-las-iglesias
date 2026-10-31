import { api } from '@/lib/api';
import type { RespuestaObjeto } from '@/types/comunes';
import type {
  ConfiguracionIglesia,
  EditarConfiguracion,
  GuardarHorario,
  HorarioReunion,
} from '@/types/configuracion';

export async function obtenerConfiguracion() {
  const res = await api.get<RespuestaObjeto<ConfiguracionIglesia>>('/configuracion');
  return res.data.data;
}

export async function actualizarConfiguracion(datos: EditarConfiguracion) {
  const res = await api.put<RespuestaObjeto<ConfiguracionIglesia>>('/configuracion', datos);
  return res.data.data;
}

export async function subirLogo(archivo: File, alProgresar?: (porcentaje: number) => void) {
  const form = new FormData();
  form.append('logo', archivo);
  const res = await api.post<RespuestaObjeto<ConfiguracionIglesia>>('/configuracion/logo', form, {
    onUploadProgress: (e) => {
      if (e.total) alProgresar?.(Math.round((e.loaded / e.total) * 100));
    },
  });
  return res.data.data;
}

export async function listarHorarios() {
  const res = await api.get<RespuestaObjeto<HorarioReunion[]>>('/configuracion/horarios');
  return res.data.data;
}

export async function crearHorario(datos: GuardarHorario) {
  const res = await api.post<RespuestaObjeto<HorarioReunion>>('/configuracion/horarios', datos);
  return res.data.data;
}

export async function editarHorario(id: string, datos: Partial<GuardarHorario>) {
  const res = await api.patch<RespuestaObjeto<HorarioReunion>>(
    `/configuracion/horarios/${id}`,
    datos,
  );
  return res.data.data;
}

export async function eliminarHorario(id: string) {
  await api.delete(`/configuracion/horarios/${id}`);
}
