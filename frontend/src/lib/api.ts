import axios, { type AxiosError, type InternalAxiosRequestConfig, isAxiosError } from 'axios';
import type { ErrorApi } from '@/types/comunes';
import type { RespuestaRefresh } from '@/types/usuarios';
import { API_URL as BASE_URL } from './config';

// ───────── Token de acceso: solo en memoria, nunca en localStorage (F1-09) ─────────
let accessToken: string | null = null;
let alExpirarSesion: (() => void) | null = null;

export function obtenerToken() {
  return accessToken;
}

export function guardarToken(token: string | null) {
  accessToken = token;
}

/** El AuthProvider registra qué hacer cuando el refresh falla (cerrar sesión). */
export function registrarAlExpirarSesion(callback: (() => void) | null) {
  alExpirarSesion = callback;
}

// ───────── Cliente ─────────
export const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Un solo refresh a la vez: las peticiones que fallen mientras tanto esperan esta promesa
let refreshEnCurso: Promise<string> | null = null;

/** POST /auth/refresh con la cookie httpOnly. Sin interceptores para evitar ciclos. */
export function refrescarToken(): Promise<string> {
  refreshEnCurso ??= axios
    .post<{ data: RespuestaRefresh }>(`${BASE_URL}/auth/refresh`, null, { withCredentials: true })
    .then((res) => {
      guardarToken(res.data.data.accessToken);
      return res.data.data.accessToken;
    })
    .finally(() => {
      refreshEnCurso = null;
    });
  return refreshEnCurso;
}

type ConfigConReintento = InternalAxiosRequestConfig & { _reintentado?: boolean };

api.interceptors.response.use(undefined, async (error: AxiosError<{ error?: ErrorApi }>) => {
  const config = error.config as ConfigConReintento | undefined;
  const expirado =
    error.response?.status === 401 && error.response.data?.error?.code === 'TOKEN_EXPIRED';

  if (!expirado || !config || config._reintentado) {
    throw normalizarError(error);
  }

  config._reintentado = true;
  try {
    const token = await refrescarToken();
    config.headers.Authorization = `Bearer ${token}`;
    return api(config);
  } catch (errorRefresh) {
    guardarToken(null);
    alExpirarSesion?.();
    throw normalizarError(errorRefresh);
  }
});

// ───────── Errores ─────────
export function esErrorApi(error: unknown): error is ErrorApi {
  return (
    typeof error === 'object' &&
    error !== null &&
    // AxiosError también tiene code/status/message: no es un ErrorApi normalizado
    !isAxiosError(error) &&
    'code' in error &&
    'status' in error &&
    'message' in error
  );
}

/** Convierte cualquier error (Axios, red, desconocido) al formato ErrorApi. */
export function normalizarError(error: unknown): ErrorApi {
  if (esErrorApi(error)) return error;
  if (isAxiosError<{ error?: Omit<ErrorApi, 'status'> }>(error)) {
    if (!error.response) {
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor. Revisa tu conexión.',
      };
    }
    const cuerpo = error.response.data?.error;
    if (cuerpo?.code) return { status: error.response.status, ...cuerpo };
  }
  return { status: 500, code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' };
}

/** Busca el mensaje de error de un campo en un ErrorApi de validación. */
export function errorDeCampo(error: unknown, campo: string): string | undefined {
  if (!esErrorApi(error)) return undefined;
  return error.details?.find((d) => d.campo === campo)?.mensaje;
}
