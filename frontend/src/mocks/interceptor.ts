import {
  HttpErrorResponse,
  type HttpEvent,
  HttpHeaders,
  type HttpInterceptorFn,
  type HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { getResponse } from 'msw';
import { from, type Observable, switchMap } from 'rxjs';
import { handlers } from './handlers';

/** HttpRequest de Angular → Request de la API Fetch (lo que esperan los handlers de MSW). */
function aRequest(req: HttpRequest<unknown>): Request {
  const headers = new Headers();
  for (const clave of req.headers.keys()) headers.set(clave, req.headers.get(clave) ?? '');
  let body: BodyInit | undefined;
  if (req.body instanceof FormData) body = req.body;
  else if (req.body !== null && req.body !== undefined) {
    body = JSON.stringify(req.body);
    headers.set('Content-Type', 'application/json');
  }
  return new Request(req.urlWithParams, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
    credentials: 'include',
  });
}

async function aEvento(req: HttpRequest<unknown>, res: Response): Promise<HttpEvent<unknown>> {
  // Con responseType 'blob' (descargas) el cuerpo llega como Blob, también en los errores,
  // igual que con el HttpClient real
  const cuerpo: unknown =
    req.responseType === 'blob'
      ? await res.blob()
      : await res.text().then((texto) => (texto ? (JSON.parse(texto) as unknown) : null));
  const headers = new HttpHeaders(Object.fromEntries(res.headers.entries()));
  if (!res.ok) {
    throw new HttpErrorResponse({ error: cuerpo, status: res.status, headers, url: req.url });
  }
  return new HttpResponse({ body: cuerpo, status: res.status, headers, url: req.url });
}

/**
 * Responde con los handlers de MSW (src/mocks/handlers) sin Service Worker.
 * Mismo contrato y mismos datos que los mocks del frontend en React; lo que no tiene handler
 * sigue a la red. Se activa con `environment.usarMocks` y también lo usan las pruebas.
 */
export const interceptorMocks: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> =>
  from(getResponse(handlers, aRequest(req))).pipe(
    switchMap((res) => (res ? from(aEvento(req, res)) : next(req))),
  );
