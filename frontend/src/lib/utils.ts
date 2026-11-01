import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combina clases de Tailwind resolviendo conflictos (patrón shadcn/ui)
export function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas));
}
