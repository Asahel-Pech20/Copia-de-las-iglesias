import { QueryClient } from '@tanstack/react-query';
import { esErrorApi } from './api';

// Reintenta solo errores de red; los errores del servidor (4xx/5xx) se muestran de inmediato
export function crearQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (intentos, error) =>
          esErrorApi(error) && error.code === 'NETWORK_ERROR' && intentos < 2,
      },
      mutations: { retry: false },
    },
  });
}

export const queryClient = crearQueryClient();
