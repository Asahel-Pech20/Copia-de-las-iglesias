import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EditarConfiguracion, GuardarHorario } from '@/types/configuracion';
import * as configuracionApi from './api';

export const clavesConfiguracion = {
  todo: ['configuracion'] as const,
  datos: ['configuracion', 'datos'] as const,
  horarios: ['configuracion', 'horarios'] as const,
};

/** Configuración global de la iglesia (nombre, logo, moneda…). La usan layout, login y formatearMoneda. */
export function useConfiguracion() {
  return useQuery({
    queryKey: clavesConfiguracion.datos,
    queryFn: configuracionApi.obtenerConfiguracion,
    staleTime: 5 * 60_000,
  });
}

export function useActualizarConfiguracion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: EditarConfiguracion) => configuracionApi.actualizarConfiguracion(datos),
    onSuccess: (config) => queryClient.setQueryData(clavesConfiguracion.datos, config),
  });
}

export function useSubirLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ archivo, alProgresar }: { archivo: File; alProgresar?: (p: number) => void }) =>
      configuracionApi.subirLogo(archivo, alProgresar),
    onSuccess: (config) => queryClient.setQueryData(clavesConfiguracion.datos, config),
  });
}

export function useHorarios() {
  return useQuery({
    queryKey: clavesConfiguracion.horarios,
    queryFn: configuracionApi.listarHorarios,
  });
}

export function useGuardarHorario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id?: string; datos: GuardarHorario }) =>
      id ? configuracionApi.editarHorario(id, datos) : configuracionApi.crearHorario(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesConfiguracion.horarios }),
  });
}

export function useEliminarHorario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => configuracionApi.eliminarHorario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesConfiguracion.horarios }),
  });
}
