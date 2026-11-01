import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Rol } from '@/types/comunes';

// Helpers de formato de AGENTS.md §4 (UX). Todas las fechas se muestran en español.

function aFecha(valor: string | Date | null | undefined): Date | null {
  if (!valor) return null;
  // "2026-10-30" (@db.Date) se interpreta como fecha local, no UTC, para no restar un día
  const fecha =
    typeof valor === 'string'
      ? /^\d{4}-\d{2}-\d{2}$/.test(valor)
        ? parseISO(`${valor}T00:00:00`)
        : parseISO(valor)
      : valor;
  return isValid(fecha) ? fecha : null;
}

/** dd/MM/yyyy — "—" si no hay valor */
export function formatearFecha(valor: string | Date | null | undefined): string {
  const fecha = aFecha(valor);
  return fecha ? format(fecha, 'dd/MM/yyyy', { locale: es }) : '—';
}

/** dd/MM/yyyy HH:mm — "—" si no hay valor */
export function formatearFechaHora(valor: string | Date | null | undefined): string {
  const fecha = aFecha(valor);
  return fecha ? format(fecha, 'dd/MM/yyyy HH:mm', { locale: es }) : '—';
}

/** Fecha larga: "jueves, 30 de octubre de 2026" */
export function formatearFechaLarga(valor: string | Date | null | undefined): string {
  const fecha = aFecha(valor);
  return fecha ? format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : '—';
}

/** Moneda con Intl en es-MX. El monto llega como string desde la API ("1500.00"). */
export function formatearMoneda(monto: string | number | null | undefined, moneda = 'MXN'): string {
  if (monto === null || monto === undefined || monto === '') return '—';
  const numero = typeof monto === 'string' ? Number(monto) : monto;
  if (Number.isNaN(numero)) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(numero);
}

/** Fecha a "yyyy-MM-dd" para enviar a la API (campos @db.Date) */
export function aFechaApi(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd');
}

// ───────── Etiquetas de enums en español ─────────
// Cada dueño agrega las de su módulo (F2–F4) siguiendo el mismo patrón.

export const ETIQUETAS_ROL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  PASTOR: 'Pastor',
  SECRETARIO: 'Secretario',
  TESORERO: 'Tesorero',
  COORDINADOR: 'Coordinador',
};

export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

/** Convierte un mapa de etiquetas en opciones para SelectEnum */
export function opcionesDe<T extends string>(etiquetas: Record<T, string>) {
  return (Object.entries(etiquetas) as [T, string][]).map(([valor, etiqueta]) => ({
    valor,
    etiqueta,
  }));
}
