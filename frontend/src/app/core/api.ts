import {
  HttpClient,
  HttpErrorResponse,
  type HttpEvent,
  type HttpHandlerFn,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  finalize,
  from,
  map,
  type Observable,
  of,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import type { ErrorApi, RespuestaLista, RespuestaObjeto } from '@/app/tipos/comunes';
import type { RespuestaRefresh } from '@/app/tipos/usuarios';
import { API_URL } from './config';

// ───────── Token de acceso: solo en memoria, nunca en localStorage (F1-09) ─────────
let accessToken: string | null = null;
let alExpirarSesion: (() => void) | null = null;

export function obtenerToken() {
  return accessToken;
}

export function guardarToken(token: string | null) {
  accessToken = token;
}

/** El SesionService registra qué hacer cuando el refresh falla (cerrar sesión). */
export function registrarAlExpirarSesion(callback: (() => void) | null) {
  alExpirarSesion = callback;
}

// ───────── Errores ─────────
export function esErrorApi(error: unknown): error is ErrorApi {
  return (
    typeof error === 'object' &&
    error !== null &&
    !(error instanceof HttpErrorResponse) &&
    'code' in error &&
    'status' in error &&
    'message' in error
  );
}

/** Convierte cualquier error (HTTP, red, desconocido) al formato ErrorApi. */
export function normalizarError(error: unknown): ErrorApi {
  if (esErrorApi(error)) return error;
  // rxResource envuelve en un Error lo que lanza el stream: el error original va en `cause`
  if (error instanceof Error && error.cause !== undefined && error.cause !== error) {
    return normalizarError(error.cause);
  }
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor. Revisa tu conexión.',
      };
    }
    const cuerpo = (error.error as { error?: Omit<ErrorApi, 'status'> } | null)?.error;
    if (cuerpo?.code) return { status: error.status, ...cuerpo };
  }
  return { status: 500, code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' };
}

/** Busca el mensaje de error de un campo en un ErrorApi de validación. */
export function errorDeCampo(error: unknown, campo: string): string | undefined {
  if (!esErrorApi(error)) return undefined;
  return error.details?.find((d) => d.campo === campo)?.mensaje;
}

// ───────── Interceptor: Bearer + un solo refresh a la vez ─────────
let refreshEnCurso: Observable<string> | null = null;

function refrescar(http: HttpClient): Observable<string> {
  refreshEnCurso ??= http
    .post<RespuestaObjeto<RespuestaRefresh>>(`${API_URL}/auth/refresh`, null, {
      withCredentials: true,
    })
    .pipe(
      map((res) => {
        guardarToken(res.data.accessToken);
        return res.data.accessToken;
      }),
      finalize(() => {
        refreshEnCurso = null;
      }),
      shareReplay(1),
    );
  return refreshEnCurso;
}

function conToken(req: HttpRequest<unknown>, token: string | null) {
  return req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/** Blob de cualquier realm (en las pruebas el Blob de jsdom y el de Node son clases distintas). */
function esBlob(valor: unknown): valor is Blob {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'size' in valor &&
    typeof (valor as Blob).text === 'function'
  );
}

/**
 * Con `responseType: 'blob'` el JSON de un error llega como Blob: se lee aquí para que el resto
 * del interceptor (TOKEN_EXPIRED) y los servicios vean el mismo error que en una petición normal.
 */
function leerErrorBlob(error: unknown): Observable<unknown> {
  if (!(error instanceof HttpErrorResponse) || !esBlob(error.error)) return of(error);
  return from(error.error.text()).pipe(
    map((texto): unknown => {
      try {
        return new HttpErrorResponse({
          error: JSON.parse(texto) as unknown,
          status: error.status,
          statusText: error.statusText,
          headers: error.headers,
          url: error.url ?? undefined,
        });
      } catch {
        return error;
      }
    }),
    catchError(() => of(error)),
  );
}

/** Agrega el access token, y si expiró lo renueva con la cookie y reintenta una vez. */
export const interceptorApi: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (!req.url.startsWith(API_URL)) return next(req);
  const http = inject(HttpClient);
  const esRefresh = req.url.endsWith('/auth/refresh');

  return next(conToken(req, esRefresh ? null : accessToken)).pipe(
    catchError((errorCrudo: unknown) =>
      leerErrorBlob(errorCrudo).pipe(switchMap((e) => throwError(() => e))),
    ),
    catchError((error: unknown) => {
      const expirado =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        normalizarError(error).code === 'TOKEN_EXPIRED';
      if (!expirado || esRefresh) return throwError(() => normalizarError(error));

      return refrescar(http).pipe(
        catchError((errorRefresh: unknown) => {
          guardarToken(null);
          alExpirarSesion?.();
          return throwError(() => normalizarError(errorRefresh));
        }),
        switchMap((token) =>
          next(conToken(req, token)).pipe(
            catchError((e: unknown) => throwError(() => normalizarError(e))),
          ),
        ),
      );
    }),
  );
};

type Parametros = Record<string, string | number | boolean | undefined | null>;

/** Quita los parámetros vacíos para no mandar `?q=&estado=` */
function limpiar(params?: Parametros) {
  const salida: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(params ?? {})) {
    if (valor !== undefined && valor !== null && valor !== '') salida[clave] = String(valor);
  }
  return salida;
}

/**
 * Cliente del contrato (specs.md §7): desenvuelve `{ data }` y `{ data, meta }`.
 * Los servicios de cada módulo lo usan; las páginas nunca llaman a HttpClient directamente.
 */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  objeto<T>(ruta: string, params?: Parametros) {
    return this.http
      .get<RespuestaObjeto<T>>(`${API_URL}${ruta}`, { params: limpiar(params) })
      .pipe(map((r) => r.data));
  }

  lista<T>(ruta: string, params?: Parametros) {
    return this.http.get<RespuestaLista<T>>(`${API_URL}${ruta}`, { params: limpiar(params) });
  }

  post<T>(ruta: string, cuerpo?: unknown) {
    return this.http
      .post<RespuestaObjeto<T> | null>(`${API_URL}${ruta}`, cuerpo ?? null)
      .pipe(map((r) => r?.data as T));
  }

  /** POST que devuelve también `meta` (p. ej. advertencia de duplicado al crear miembro). */
  postConMeta<T, M>(ruta: string, cuerpo: unknown) {
    return this.http.post<{ data: T; meta?: M }>(`${API_URL}${ruta}`, cuerpo);
  }

  patch<T>(ruta: string, cuerpo?: unknown) {
    return this.http
      .patch<RespuestaObjeto<T> | null>(`${API_URL}${ruta}`, cuerpo ?? {})
      .pipe(map((r) => r?.data as T));
  }

  put<T>(ruta: string, cuerpo: unknown) {
    return this.http
      .put<RespuestaObjeto<T> | null>(`${API_URL}${ruta}`, cuerpo)
      .pipe(map((r) => r?.data as T));
  }

  delete(ruta: string) {
    return this.http.delete<void>(`${API_URL}${ruta}`);
  }
}
