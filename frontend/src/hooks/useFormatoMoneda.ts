import { useCallback } from 'react';
import { useConfiguracion } from '@/features/configuracion/hooks';
import { formatearMoneda } from '@/lib/formato';

/**
 * Formateador de montos con la moneda de la configuración de la iglesia (AGENTS.md §4 UX).
 * @example const moneda = useFormatoMoneda(); moneda(donacion.monto)  // "$1,500.00"
 */
export function useFormatoMoneda() {
  const { data: config } = useConfiguracion();
  const codigo = config?.moneda;
  return useCallback(
    (monto: string | number | null | undefined) => formatearMoneda(monto, codigo),
    [codigo],
  );
}
