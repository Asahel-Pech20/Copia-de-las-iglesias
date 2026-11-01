import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Rol } from '@/types/comunes';
import type { CrearUsuario, EditarUsuario, QueryUsuarios } from '@/types/usuarios';
import * as usuariosApi from './api';

export const clavesUsuarios = {
  todo: ['usuarios'] as const,
  lista: (filtros: QueryUsuarios) => ['usuarios', 'lista', filtros] as const,
  opciones: (rol?: Rol) => ['usuarios', 'opciones', rol] as const,
};

export function useUsuarios(filtros: QueryUsuarios) {
  return useQuery({
    queryKey: clavesUsuarios.lista(filtros),
    queryFn: () => usuariosApi.listarUsuarios(filtros),
    placeholderData: keepPreviousData,
  });
}

/** Usuarios activos para selectores (p. ej. coordinadores de ministerio en F2). */
export function useOpcionesUsuario(rol?: Rol) {
  return useQuery({
    queryKey: clavesUsuarios.opciones(rol),
    queryFn: () => usuariosApi.listarOpcionesUsuario(rol),
  });
}

function useInvalidarUsuarios() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: clavesUsuarios.todo });
}

export function useGuardarUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: ({ id, datos }: { id?: string; datos: CrearUsuario | EditarUsuario }) =>
      id ? usuariosApi.editarUsuario(id, datos) : usuariosApi.crearUsuario(datos as CrearUsuario),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      usuariosApi.cambiarEstadoUsuario(id, activo),
    onSuccess: invalidar,
  });
}

export function useReenviarInvitacion() {
  return useMutation({ mutationFn: (id: string) => usuariosApi.reenviarInvitacion(id) });
}
