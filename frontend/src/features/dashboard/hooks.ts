import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from './api';

export const clavesDashboard = {
  todo: ['dashboard'] as const,
};

/** Datos del panel principal. `ingresos` solo viene si el rol tiene `donaciones:leer`. */
export function useDashboard() {
  return useQuery({
    queryKey: clavesDashboard.todo,
    queryFn: dashboardApi.obtenerDashboard,
    // El backend lo cachea 60 s; no tiene sentido pedirlo más seguido
    staleTime: 60_000,
  });
}
