/**
 * Formato común de los reportes (B4-09). Cada reporte arma un `Reporte` y `responderReporte`
 * lo devuelve como JSON (vista previa del frontend), PDF o Excel según `?formato=`.
 */
import type { Response } from 'express';
import { AppError } from '../appError';
import { ok } from '../respuesta';
import { aExcel } from './excel';
import { aPdf } from './pdf';

export const FORMATOS = ['json', 'pdf', 'xlsx'] as const;
export type Formato = (typeof FORMATOS)[number];

/** Más filas que esto vuelven el PDF ilegible y lento: se pide Excel o acotar los filtros. */
export const MAX_FILAS_PDF = 5000;

export type TipoColumna = 'texto' | 'fecha' | 'fechaHora' | 'moneda' | 'numero' | 'porcentaje';
export type Celda = string | number | null;

export interface Columna {
  clave: string;
  titulo: string;
  tipo?: TipoColumna;
  /** Peso relativo del ancho en PDF (1 por defecto). */
  ancho?: number;
}

export interface Seccion {
  titulo: string;
  columnas: Columna[];
  filas: Record<string, Celda>[];
  /** Fila de totales (mismas claves que las columnas). */
  totales?: Record<string, Celda>;
}

export interface Dato {
  etiqueta: string;
  valor: Celda;
  tipo?: TipoColumna;
}

export interface Reporte {
  tipo: 'miembros' | 'asistencia' | 'ministerios' | 'ingresos';
  titulo: string;
  subtitulo?: string;
  /** Filtros aplicados, ya legibles ("Estado: Activos"). */
  filtros: Dato[];
  /** Cifras clave que se muestran antes de las tablas. */
  resumen: Dato[];
  secciones: Seccion[];
  generadoEn: string;
  generadoPor: string;
}

/** Datos de la iglesia para encabezados y formatos (moneda, zona horaria). */
export interface ContextoReporte {
  nombreIglesia: string;
  moneda: string;
  zonaHoraria: string;
  /** Ruta en disco del logotipo (PNG o JPG) o null. */
  logo: string | null;
}

// ───────── Formato de celdas (mismos formatos que frontend/src/lib/formato.ts) ─────────

const fechaCorta = (valor: string) => {
  const [anio, mes, dia] = valor.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
};

export function formatearCelda(valor: Celda, tipo: TipoColumna = 'texto', ctx: ContextoReporte) {
  if (valor === null || valor === '') return '—';
  switch (tipo) {
    case 'fecha':
      return fechaCorta(String(valor));
    case 'fechaHora':
      return new Intl.DateTimeFormat('es-MX', {
        timeZone: ctx.zonaHoraria,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
        .format(new Date(valor))
        .replace(',', '');
    case 'moneda':
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: ctx.moneda }).format(
        Number(valor),
      );
    case 'numero':
      return Number(valor).toLocaleString('es-MX');
    case 'porcentaje':
      return `${Number(valor).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
    default:
      return String(valor);
  }
}

/** "reporte-miembros-2026-10-30.pdf" (fecha de generación en la zona horaria de la iglesia). */
export function nombreArchivo(
  reporte: Reporte,
  formato: Exclude<Formato, 'json'>,
  zonaHoraria: string,
) {
  const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: zonaHoraria }).format(
    new Date(reporte.generadoEn),
  );
  return `reporte-${reporte.tipo}-${fecha}.${formato}`;
}

const TIPOS_MIME = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
} as const;

/** Responde el reporte en el formato pedido (JSON con `{ data }`, o archivo adjunto). */
export async function responderReporte(
  res: Response,
  formato: Formato,
  reporte: Reporte,
  ctx: ContextoReporte,
) {
  if (formato === 'json') {
    res.json(ok(reporte));
    return;
  }
  if (formato === 'pdf') {
    const filas = reporte.secciones.reduce((total, s) => total + s.filas.length, 0);
    if (filas > MAX_FILAS_PDF) {
      throw AppError.reglaNegocio(
        `El reporte tiene ${filas.toLocaleString('es-MX')} filas; el PDF admite hasta ${MAX_FILAS_PDF.toLocaleString('es-MX')}. Descárgalo en Excel o acota los filtros.`,
      );
    }
  }
  const archivo = formato === 'pdf' ? await aPdf(reporte, ctx) : await aExcel(reporte, ctx);
  res
    .status(200)
    .set({
      'Content-Type': TIPOS_MIME[formato],
      'Content-Disposition': `attachment; filename="${nombreArchivo(reporte, formato, ctx.zonaHoraria)}"`,
      // El frontend lee el nombre del archivo desde otro origen (localhost:5173)
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Length': String(archivo.length),
    })
    .end(archivo);
}
