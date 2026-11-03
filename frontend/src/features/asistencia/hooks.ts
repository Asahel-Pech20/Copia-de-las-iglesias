import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  QueryAsistencias,
  QueryResumenAsistencia,
  RegistrarAsistencia,
} from '@/types/asistencia';
import * as asistenciaApi from './api';

export const clavesAsistencia = {
  todo: ['asistencia'] as const,
  lista: (eventoId: string) => ['asistencia', 'evento', eventoId] as const,
  historial: (filtros: QueryAsistencias) => ['asistencia', 'lista', filtros] as const,
  resumen: (filtros: QueryResumenAsistencia) => ['asistencia', 'resumen', filtros] as const,
};

/** Pase de lista de un evento (miembros esperados + estado). */
export function useListaAsistencia(eventoId: string | undefined) {
  return useQuery({
    queryKey: clavesAsistencia.lista(eventoId ?? ''),
    queryFn: () => asistenciaApi.obtenerLista(eventoId!),
    enabled: Boolean(eventoId),
  });
}

export function useRegistrarAsistencia(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: RegistrarAsistencia) => asistenciaApi.registrarAsistencia(eventoId, datos),
    onSuccess: (lista) => {
      queryClient.setQueryData(clavesAsistencia.lista(eventoId), lista);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: clavesAsistencia.todo }),
        // El evento puede pasar a REALIZADO y cambia su resumen de asistencia
        queryClient.invalidateQueries({ queryKey: ['eventos'] }),
      ]);
    },
  });
}

/**
 * Historial de asistencia paginado. También para el perfil del miembro (F2-04):
 * `useAsistencias({ miembroId })`.
 */
export function useAsistencias(filtros: QueryAsistencias, opciones: { habilitado?: boolean } = {}) {
  return useQuery({
    queryKey: clavesAsistencia.historial(filtros),
    queryFn: () => asistenciaApi.listarAsistencias(filtros),
    placeholderData: keepPreviousData,
    enabled: opciones.habilitado ?? true,
  });
}

export function useResumenAsistencia(filtros: QueryResumenAsistencia) {
  return useQuery({
    queryKey: clavesAsistencia.resumen(filtros),
    queryFn: () => asistenciaApi.resumenAsistencia(filtros),
    placeholderData: keepPreviousData,
  });
}
