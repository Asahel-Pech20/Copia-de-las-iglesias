import { formatearFecha, formatearFechaHora } from '@/app/core/formato';
import type { Celda, TipoColumna } from '@/app/tipos/reportes';

/** Filas que se dibujan en pantalla; el archivo descargado trae todas. */
export const MAX_FILAS_VISTA = 100;

/** Formatea una celda del reporte según su tipo (mismos formatos que el PDF y el Excel). */
export function formatearCelda(
  valor: Celda | undefined,
  tipo: TipoColumna | undefined,
  moneda: (monto: string | number | null) => string,
): string {
  if (valor === null || valor === undefined || valor === '') return '—';
  switch (tipo) {
    // Las filas de totales pueden traer texto ("Total") en una columna de fecha
    case 'fecha':
      return /^\d{4}-\d{2}-\d{2}/.test(String(valor))
        ? formatearFecha(String(valor))
        : String(valor);
    case 'fechaHora':
      return /^\d{4}-\d{2}-\d{2}/.test(String(valor))
        ? formatearFechaHora(String(valor))
        : String(valor);
    case 'moneda':
      return moneda(valor);
    case 'numero':
      return Number(valor).toLocaleString('es-MX');
    case 'porcentaje':
      return `${Number(valor).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
    default:
      return String(valor);
  }
}
