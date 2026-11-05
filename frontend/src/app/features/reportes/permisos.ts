import type { Permiso } from '@/app/tipos/comunes';
import type { TipoReporte } from '@/app/tipos/reportes';

/** Permisos que dan acceso a cada reporte (specs.md §3); basta con tener uno. */
export function permisosDeReporte(tipo: TipoReporte): Permiso[] {
  return tipo === 'ingresos'
    ? ['reportes:ingresos']
    : ['reportes:generales', 'reportes:generales-propio'];
}
