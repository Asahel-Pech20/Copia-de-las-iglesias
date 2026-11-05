import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { Api } from '@/app/core/api';
import { API_URL } from '@/app/core/config';
import type {
  ArchivoDescargado,
  FiltrosReporte,
  FormatoDescarga,
  Reporte,
  TipoReporte,
} from '@/app/tipos/reportes';
import { guardarArchivo } from './descarga';

/** Quita los filtros vacíos para no enviar `?desde=&hasta=`. */
function limpiar(filtros: FiltrosReporte) {
  const salida: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') salida[clave] = String(valor);
  }
  return salida;
}

/** Nombre del archivo en `Content-Disposition: attachment; filename="reporte-miembros-….pdf"`. */
export function nombreDeContentDisposition(cabecera: string | null): string | null {
  if (!cabecera) return null;
  const codificado = /filename\*=UTF-8''([^;]+)/i.exec(cabecera)?.[1];
  if (codificado) {
    try {
      return decodeURIComponent(codificado);
    } catch {
      // se usa el nombre simple
    }
  }
  return /filename="?([^";]+)"?/i.exec(cabecera)?.[1] ?? null;
}

/** Reportes en JSON (vista previa) y descarga en PDF / Excel (F4-09, F4-10). */
@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly api = inject(Api);
  private readonly http = inject(HttpClient);

  /** Vista previa: el mismo reporte en JSON. */
  vistaPrevia(tipo: TipoReporte, filtros: FiltrosReporte) {
    return this.api.objeto<Reporte>(`/reportes/${tipo}`, { ...limpiar(filtros), formato: 'json' });
  }

  /**
   * Pide el archivo. Los errores (p. ej. el 422 de más de 5 000 filas en PDF) llegan como Blob:
   * `interceptorApi` los convierte al formato ErrorApi para mostrar el mensaje del servidor.
   */
  archivo(tipo: TipoReporte, filtros: FiltrosReporte, formato: FormatoDescarga) {
    return this.http
      .get(`${API_URL}/reportes/${tipo}`, {
        params: { ...limpiar(filtros), formato },
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((res): ArchivoDescargado => ({
          blob: res.body as Blob,
          nombre:
            nombreDeContentDisposition(res.headers.get('Content-Disposition')) ??
            `reporte-${tipo}.${formato}`,
        })),
      );
  }

  /** Descarga el reporte y lo guarda con el nombre de `Content-Disposition`. */
  descargar(tipo: TipoReporte, filtros: FiltrosReporte, formato: FormatoDescarga) {
    return this.archivo(tipo, filtros, formato).pipe(tap((archivo) => guardarArchivo(archivo)));
  }
}
