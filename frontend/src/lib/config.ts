// Variables de entorno con valores por defecto: el frontend arranca con mocks aunque no exista frontend/.env
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const USAR_MOCKS =
  import.meta.env.VITE_USE_MOCKS === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === undefined);
