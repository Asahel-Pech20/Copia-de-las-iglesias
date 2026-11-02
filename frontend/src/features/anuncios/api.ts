import { api } from '@/lib/api';
import type { Anuncio, Cartelera, GuardarAnuncio, QueryAnuncios } from '@/types/anuncios';
import type { RespuestaLista, RespuestaObjeto } from '@/types/comunes';

export async function listarAnuncios(query: QueryAnuncios) {
  const res = await api.get<RespuestaLista<Anuncio>>('/anuncios', { params: query });
  return res.data;
}

export async function crearAnuncio(datos: GuardarAnuncio) {
  const res = await api.post<RespuestaObjeto<Anuncio>>('/anuncios', datos);
  return res.data.data;
}

export async function editarAnuncio(id: string, datos: Partial<GuardarAnuncio>) {
  const res = await api.patch<RespuestaObjeto<Anuncio>>(`/anuncios/${id}`, datos);
  return res.data.data;
}

export async function eliminarAnuncio(id: string) {
  await api.delete(`/anuncios/${id}`);
}

/** Cartelera pública (sin sesión). */
export async function obtenerCartelera() {
  const res = await api.get<RespuestaObjeto<Cartelera>>('/public/cartelera');
  return res.data.data;
}
