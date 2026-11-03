import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GuardarAnuncio, QueryAnuncios } from '@/types/anuncios';
import * as anunciosApi from './api';

export const clavesAnuncios = {
  todo: ['anuncios'] as const,
  lista: (filtros: QueryAnuncios) => ['anuncios', 'lista', filtros] as const,
  cartelera: ['anuncios', 'cartelera'] as const,
};

export function useAnuncios(filtros: QueryAnuncios) {
  return useQuery({
    queryKey: clavesAnuncios.lista(filtros),
    queryFn: () => anunciosApi.listarAnuncios(filtros),
    placeholderData: keepPreviousData,
  });
}

/**
 * Anuncios vigentes, IMPORTANTE primero (para el dashboard, F4).
 * @example const { data } = useAnunciosVigentes({ soloImportantes: true, limit: 3 })
 */
export function useAnunciosVigentes({
  soloImportantes = false,
  limit = 5,
}: { soloImportantes?: boolean; limit?: number } = {}) {
  const filtros: QueryAnuncios = {
    vigentes: true,
    limit,
    ...(soloImportantes && { prioridad: 'IMPORTANTE' }),
  };
  return useQuery({
    queryKey: clavesAnuncios.lista(filtros),
    queryFn: async () => (await anunciosApi.listarAnuncios(filtros)).data,
  });
}

function useInvalidar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: clavesAnuncios.todo });
}

export function useCrearAnuncio() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (datos: GuardarAnuncio) => anunciosApi.crearAnuncio(datos),
    onSuccess: invalidar,
  });
}

export function useEditarAnuncio() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: Partial<GuardarAnuncio> }) =>
      anunciosApi.editarAnuncio(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarAnuncio() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (id: string) => anunciosApi.eliminarAnuncio(id),
    onSuccess: invalidar,
  });
}

/** Cartelera pública; con `refrescoMs` se vuelve a pedir periódicamente (modo pantalla). */
export function useCartelera(refrescoMs?: number) {
  return useQuery({
    queryKey: clavesAnuncios.cartelera,
    queryFn: anunciosApi.obtenerCartelera,
    refetchInterval: refrescoMs,
  });
}
