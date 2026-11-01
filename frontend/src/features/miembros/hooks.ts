import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CambiarEstadoMiembro,
  CrearMiembro,
  EditarMiembro,
  QueryMiembros,
} from '@/types/miembros';
import * as miembrosApi from './api';

export const clavesMiembros = {
  todo: ['miembros'] as const,
  lista: (filtros: QueryMiembros) => ['miembros', 'lista', filtros] as const,
  detalle: (id: string) => ['miembros', 'detalle', id] as const,
};

export function useMiembros(filtros: QueryMiembros, opciones: { habilitado?: boolean } = {}) {
  return useQuery({
    queryKey: clavesMiembros.lista(filtros),
    queryFn: () => miembrosApi.listarMiembros(filtros),
    placeholderData: keepPreviousData,
    enabled: opciones.habilitado ?? true,
  });
}

/** Detalle de un miembro (también para otros módulos: F3, F4). */
export function useMiembro(id: string | undefined) {
  return useQuery({
    queryKey: clavesMiembros.detalle(id ?? ''),
    queryFn: () => miembrosApi.obtenerMiembro(id!),
    enabled: Boolean(id),
  });
}

/** Invalida miembros y ministerios (los conteos de integrantes dependen de ambos). */
function useInvalidar() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesMiembros.todo }),
      queryClient.invalidateQueries({ queryKey: ['ministerios'] }),
    ]);
}

export function useCrearMiembro() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (datos: CrearMiembro) => miembrosApi.crearMiembro(datos),
    onSuccess: invalidar,
  });
}

export function useEditarMiembro() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: EditarMiembro }) =>
      miembrosApi.editarMiembro(id, datos),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoMiembro() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, ...datos }: CambiarEstadoMiembro & { id: string }) =>
      miembrosApi.cambiarEstadoMiembro(id, datos),
    onSuccess: invalidar,
  });
}
