import { api } from '@/lib/api';
import type { RespuestaObjeto } from '@/types/comunes';
import type { RespuestaLogin, Sesion } from '@/types/usuarios';

export async function login(email: string, password: string) {
  const res = await api.post<RespuestaObjeto<RespuestaLogin>>('/auth/login', { email, password });
  return res.data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function obtenerSesion() {
  const res = await api.get<RespuestaObjeto<Sesion>>('/auth/me');
  return res.data.data;
}

export async function solicitarRecuperacion(email: string) {
  await api.post('/auth/forgot-password', { email });
}

export async function restablecerPassword(token: string, password: string) {
  await api.post('/auth/reset-password', { token, password });
}

export async function cambiarPassword(passwordActual: string, passwordNueva: string) {
  await api.patch('/auth/me/password', { passwordActual, passwordNueva });
}
