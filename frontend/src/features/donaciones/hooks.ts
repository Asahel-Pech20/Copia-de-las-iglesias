import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GuardarDonacion, QueryDonaciones, QueryResumenIngresos } from '@/types/donaciones';
import * as donacionesApi from './api';

export const clavesDonaciones = {
  todo: ['donaciones'] as const,
  lista: (filtros: QueryDonaciones) => ['donaciones', 'lista', filtros] as const,
  detalle: (id: string) => ['donaciones', 'detalle', id] as const,
  resumen: (filtros: QueryResumenIngresos) => ['donaciones', 'resumen', filtros] as const,
  mensual: (anio: number, mes: number) => ['donaciones', 'mensual', anio, mes] as const,
};

/** `habilitado: false` evita pedirlas a quien no tiene `donaciones:leer`. */
export function useDonaciones(filtros: QueryDonaciones, opciones: { habilitado?: boolean } = {}) {
  return useQuery({
    queryKey: clavesDonaciones.lista(filtros),
    queryFn: () => donacionesApi.listarDonaciones(filtros),
    placeholderData: keepPreviousData,
    enabled: opciones.habilitado ?? true,
  });
}

export function useDonacion(id: string | undefined) {
  return useQuery({
    queryKey: clavesDonaciones.detalle(id ?? ''),
    queryFn: () => donacionesApi.obtenerDonacion(id!),
    enabled: Boolean(id),
  });
}

export function useResumenIngresos(filtros: QueryResumenIngresos) {
  return useQuery({
    queryKey: clavesDonaciones.resumen(filtros),
    queryFn: () => donacionesApi.obtenerResumenIngresos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenMensual(anio: number, mes: number) {
  return useQuery({
    queryKey: clavesDonaciones.mensual(anio, mes),
    queryFn: () => donacionesApi.obtenerResumenMensual({ anio, mes }),
    placeholderData: keepPreviousData,
  });
}

/** Tras cada mutación se invalida el módulo y el dashboard (sus ingresos cambian). */
function useInvalidar() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesDonaciones.todo }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
}

export function useCrearDonacion() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (datos: GuardarDonacion) => donacionesApi.crearDonacion(datos),
    onSuccess: invalidar,
  });
}

export function useEditarDonacion() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: Partial<GuardarDonacion> }) =>
      donacionesApi.editarDonacion(id, datos),
    onSuccess: invalidar,
  });
}

export function useAnularDonacion() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      donacionesApi.anularDonacion(id, motivo),
    onSuccess: invalidar,
  });
}
