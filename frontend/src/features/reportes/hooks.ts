import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { FiltrosReporte, FormatoDescarga, TipoReporte } from '@/types/reportes';
import * as reportesApi from './api';
import { guardarArchivo } from './descarga';

export const clavesReportes = {
  todo: ['reportes'] as const,
  vista: (tipo: TipoReporte, filtros: FiltrosReporte) => ['reportes', tipo, filtros] as const,
};

/** Vista previa del reporte (`formato=json`) con los mismos filtros que usará la descarga. */
export function useReporte(tipo: TipoReporte, filtros: FiltrosReporte, habilitado = true) {
  return useQuery({
    queryKey: clavesReportes.vista(tipo, filtros),
    queryFn: () => reportesApi.obtenerReporte(tipo, filtros),
    placeholderData: keepPreviousData,
    enabled: habilitado,
  });
}

/**
 * Descarga el reporte en PDF o Excel y lo guarda con el nombre de `Content-Disposition`.
 * `isPending` sirve para deshabilitar el botón y `error` trae el mensaje del servidor.
 * @example const descargar = useDescargarReporte(); descargar.mutate({ tipo, filtros, formato: 'pdf' })
 */
export function useDescargarReporte() {
  return useMutation({
    mutationFn: async ({
      tipo,
      filtros,
      formato,
    }: {
      tipo: TipoReporte;
      filtros: FiltrosReporte;
      formato: FormatoDescarga;
    }) => {
      const archivo = await reportesApi.descargarReporte(tipo, filtros, formato);
      guardarArchivo(archivo);
      return archivo;
    },
  });
}
