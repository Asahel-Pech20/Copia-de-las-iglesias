import { toast } from 'sonner';
import { normalizarError } from './api';

/**
 * Toasts estándar tras cada mutación (AGENTS.md §4 UX).
 * @example onSuccess: () => notificar.exito('Miembro guardado'), onError: notificar.error
 */
export const notificar = {
  exito(mensaje: string) {
    toast.success(mensaje);
  },
  error(error: unknown) {
    toast.error(normalizarError(error).message);
  },
  info(mensaje: string) {
    toast(mensaje);
  },
};
