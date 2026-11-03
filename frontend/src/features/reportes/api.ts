import { api, refrescarToken } from '@/lib/api';
import type { RespuestaObjeto } from '@/types/comunes';
import type { ErrorApi } from '@/types/comunes';
import type {
  ArchivoDescargado,
  FiltrosReporte,
  FormatoDescarga,
  Reporte,
  TipoReporte,
} from '@/types/reportes';

/** Quita los filtros vacíos para no enviar `?desde=&hasta=`. */
function limpiar(filtros: FiltrosReporte) {
  return Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}

/** Vista previa: el mismo reporte en JSON. */
export async function obtenerReporte(tipo: TipoReporte, filtros: FiltrosReporte) {
  const res = await api.get<RespuestaObjeto<Reporte>>(`/reportes/${tipo}`, {
    params: { ...limpiar(filtros), formato: 'json' },
  });
  return res.data.data;
}

/** Lee un Blob como texto (Blob.text() no existe en todos los entornos). */
function leerTexto(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(lector.error);
    lector.readAsText(blob);
  });
}

/**
 * Con `responseType: 'blob'` el JSON de un error llega como Blob y el interceptor de lib/api.ts
 * no puede leerlo: se interpreta aquí para mostrar el mensaje del servidor (p. ej. el 422 de
 * más de 5 000 filas en PDF).
 */
async function errorDeBlob(status: number, cuerpo: unknown): Promise<ErrorApi> {
  try {
    const texto = cuerpo instanceof Blob ? await leerTexto(cuerpo) : '';
    const { error } = JSON.parse(texto) as { error?: Omit<ErrorApi, 'status'> };
    if (error?.code && error.message) return { status, ...error };
  } catch {
    // el cuerpo no era JSON
  }
  return { status, code: 'INTERNAL_ERROR', message: 'No se pudo generar el archivo.' };
}

/** Nombre del archivo en `Content-Disposition: attachment; filename="reporte-miembros-….pdf"`. */
export function nombreDeContentDisposition(cabecera: unknown): string | null {
  if (typeof cabecera !== 'string') return null;
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

export async function descargarReporte(
  tipo: TipoReporte,
  filtros: FiltrosReporte,
  formato: FormatoDescarga,
): Promise<ArchivoDescargado> {
  // validateStatus: los errores no pasan por el interceptor (que perdería el Blob), se leen aquí
  const pedir = () =>
    api.get<Blob>(`/reportes/${tipo}`, {
      params: { ...limpiar(filtros), formato },
      responseType: 'blob',
      validateStatus: () => true,
    });

  let res = await pedir();
  if (res.status === 401) {
    const error = await errorDeBlob(res.status, res.data);
    if (error.code === 'TOKEN_EXPIRED') {
      await refrescarToken();
      res = await pedir();
    }
  }
  if (res.status >= 400) throw await errorDeBlob(res.status, res.data);

  const nombre =
    nombreDeContentDisposition(res.headers['content-disposition']) ?? `reporte-${tipo}.${formato}`;
  return { blob: res.data, nombre };
}
