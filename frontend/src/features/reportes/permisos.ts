import type { Permiso } from '@/types/comunes';
import type { TipoReporte } from '@/types/reportes';

/** Permisos que dan acceso a cada reporte (specs.md §3); basta con tener uno. */
export function permisosDeReporte(tipo: TipoReporte): Permiso[] {
  return tipo === 'ingresos'
    ? ['reportes:ingresos']
    : ['reportes:generales', 'reportes:generales-propio'];
}
