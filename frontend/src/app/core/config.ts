import { environment } from '@/environments/environment';

// Equivalente a VITE_API_URL / VITE_USE_MOCKS del frontend en React
export const API_URL = environment.apiUrl;
export const USAR_MOCKS = environment.usarMocks;
