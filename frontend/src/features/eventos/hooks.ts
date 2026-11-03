import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GuardarEvento, QueryEventos } from '@/types/eventos';
import * as eventosApi from './api';

export const clavesEventos = {
  todo: ['eventos'] as const,
  lista: (filtros: QueryEventos) => ['eventos', 'lista', filtros] as const,
  proximos: (limit: number) => ['eventos', 'proximos', limit] as const,
  detalle: (id: string) => ['eventos', 'detalle', id] as const,
};

/**
 * Eventos del contrato `GET /eventos` (calendario con desde/hasta o listado paginado).
 * También para otros módulos: actividades del ministerio (F2-11) con `{ ministerioId }`.
 */
export function useEventos(filtros: QueryEventos, opciones: { habilitado?: boolean } = {}) {
  return useQuery({
    queryKey: clavesEventos.lista(filtros),
    queryFn: () => eventosApi.listarEventos(filtros),
    placeholderData: keepPreviousData,
    enabled: opciones.habilitado ?? true,
  });
}

/** Próximos eventos programados (dashboard F4, cartelera). */
export function useEventosProximos(limit = 5) {
  return useQuery({
    queryKey: clavesEventos.proximos(limit),
    queryFn: () => eventosApi.eventosProximos(limit),
  });
}

export function useEvento(id: string | undefined) {
  return useQuery({
    queryKey: clavesEventos.detalle(id ?? ''),
    queryFn: () => eventosApi.obtenerEvento(id!),
    enabled: Boolean(id),
  });
}

/** Tras cada mutación se invalida todo el módulo (calendario, detalle, próximos y anuncios ligados). */
function useInvalidar() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesEventos.todo }),
      queryClient.invalidateQueries({ queryKey: ['asistencia'] }),
    ]);
}

export function useCrearEvento() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (datos: GuardarEvento) => eventosApi.crearEvento(datos),
    onSuccess: invalidar,
  });
}

export function useEditarEvento() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: Partial<GuardarEvento> }) =>
      eventosApi.editarEvento(id, datos),
    onSuccess: invalidar,
  });
}

export function useCancelarEvento() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      eventosApi.cancelarEvento(id, motivo),
    onSuccess: invalidar,
  });
}

export function useAsignarResponsables() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, miembroIds }: { id: string; miembroIds: string[] }) =>
      eventosApi.asignarResponsables(id, miembroIds),
    onSuccess: invalidar,
  });
}
