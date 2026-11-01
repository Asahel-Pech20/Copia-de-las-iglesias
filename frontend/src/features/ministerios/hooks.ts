import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSesion } from '@/features/auth/contexto';
import { usePermiso } from '@/hooks/usePermiso';
import type {
  CrearMinisterio,
  EditarMinisterio,
  Ministerio,
  QueryIntegrantes,
  QueryMinisterios,
} from '@/types/ministerios';
import * as ministeriosApi from './api';

export const clavesMinisterios = {
  todo: ['ministerios'] as const,
  lista: (filtros: QueryMinisterios) => ['ministerios', 'lista', filtros] as const,
  detalle: (id: string) => ['ministerios', 'detalle', id] as const,
  integrantes: (id: string, filtros: QueryIntegrantes) =>
    ['ministerios', 'integrantes', id, filtros] as const,
};

/** Listado paginado. Sin argumentos: los ministerios activos (para selects de otros módulos). */
export function useMinisterios(filtros: QueryMinisterios = { activo: true, limit: 100 }) {
  return useQuery({
    queryKey: clavesMinisterios.lista(filtros),
    queryFn: () => ministeriosApi.listarMinisterios(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useMinisterio(id: string | undefined) {
  return useQuery({
    queryKey: clavesMinisterios.detalle(id ?? ''),
    queryFn: () => ministeriosApi.obtenerMinisterio(id!),
    enabled: Boolean(id),
  });
}

export function useIntegrantes(id: string, filtros: QueryIntegrantes) {
  return useQuery({
    queryKey: clavesMinisterios.integrantes(id, filtros),
    queryFn: () => ministeriosApi.listarIntegrantes(id, filtros),
    placeholderData: keepPreviousData,
  });
}

/**
 * ¿El usuario puede agregar/quitar integrantes de este ministerio?
 * ADMIN y PASTOR siempre; COORDINADOR solo si lo coordina (el backend lo vuelve a validar).
 */
export function usePuedeGestionarIntegrantes() {
  const { usuario } = useSesion();
  const completo = usePermiso('ministerios:editar');
  const propio = usePermiso('ministerios:editar-propio');
  return (ministerio: Pick<Ministerio, 'coordinadores'> | undefined) =>
    completo || (propio && Boolean(ministerio?.coordinadores.some((c) => c.id === usuario?.id)));
}

/** Invalida ministerios y miembros (los ministerios de cada miembro dependen de los vínculos). */
function useInvalidar() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesMinisterios.todo }),
      queryClient.invalidateQueries({ queryKey: ['miembros'] }),
    ]);
}

export function useGuardarMinisterio() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, datos }: { id?: string; datos: CrearMinisterio | EditarMinisterio }) =>
      id
        ? ministeriosApi.editarMinisterio(id, datos)
        : ministeriosApi.crearMinisterio(datos as CrearMinisterio),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoMinisterio() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      ministeriosApi.cambiarEstadoMinisterio(id, activo),
    onSuccess: invalidar,
  });
}

export function useAsignarCoordinadores() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, usuarioIds }: { id: string; usuarioIds: string[] }) =>
      ministeriosApi.asignarCoordinadores(id, usuarioIds),
    onSuccess: invalidar,
  });
}

export function useVincularMiembros() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, miembroIds }: { id: string; miembroIds: string[] }) =>
      ministeriosApi.vincularMiembros(id, miembroIds),
    onSuccess: invalidar,
  });
}

export function useDesvincularMiembro() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, miembroId }: { id: string; miembroId: string }) =>
      ministeriosApi.desvincularMiembro(id, miembroId),
    onSuccess: invalidar,
  });
}
