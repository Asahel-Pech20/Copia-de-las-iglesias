import type { Resource } from '@angular/core';

/**
 * Valor de un resource o undefined. `resource.value()` lanza un error si la petición falló,
 * así que las lecturas fuera de la rama "sin error" de la plantilla pasan por aquí.
 */
export function valorDe<T>(recurso: Resource<T>): T | undefined {
  return recurso.hasValue() ? recurso.value() : undefined;
}
