import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Mismas reglas que el backend (AGENTS.md §3). Cada error lleva su mensaje en español,
// así la plantilla solo muestra `mensajeError(control)`.

/** Contraseña mínima: 8 caracteres, al menos una letra y un número. */
export const validarPassword: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = String(c.value ?? '');
  if (v.length < 8) return { mensaje: 'Mínimo 8 caracteres.' };
  if (!/[a-zA-Z]/.test(v)) return { mensaje: 'Debe incluir al menos una letra.' };
  if (!/\d/.test(v)) return { mensaje: 'Debe incluir al menos un número.' };
  return null;
};

/** Campo obligatorio con mensaje propio; recorta espacios. */
export function requerido(mensaje: string): ValidatorFn {
  return (c) => (String(c.value ?? '').trim() === '' ? { mensaje } : null);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Correo válido (vacío pasa: combinar con `requerido` si es obligatorio). */
export const validarEmail: ValidatorFn = (c) => {
  const v = String(c.value ?? '').trim();
  return v === '' || EMAIL.test(v) ? null : { mensaje: 'Correo no válido.' };
};

export function maximo(n: number): ValidatorFn {
  return (c) => (String(c.value ?? '').length > n ? { mensaje: `Máximo ${n} caracteres.` } : null);
}

/** URL con protocolo (vacía pasa). */
export const validarUrl: ValidatorFn = (c) => {
  const v = String(c.value ?? '').trim();
  if (v === '') return null;
  try {
    const url = new URL(v);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? null
      : { mensaje: 'URL no válida (incluye https://).' };
  } catch {
    return { mensaje: 'URL no válida (incluye https://).' };
  }
};

/** Validador de grupo: `confirmacion` debe ser igual a `campo`. Marca el error en `confirmacion`. */
export function coinciden(campo: string, confirmacion: string): ValidatorFn {
  return (grupo) => {
    const destino = grupo.get(confirmacion);
    if (!destino) return null;
    const iguales = grupo.get(campo)?.value === destino.value;
    const errores = { ...(destino.errors ?? {}) };
    if (iguales) delete errores['noCoinciden'];
    else errores['noCoinciden'] = true;
    destino.setErrors(Object.keys(errores).length ? errores : null);
    return null;
  };
}

/** Mensaje en español del primer error de un control (o '' si no tiene). */
export function mensajeError(c: AbstractControl | null): string {
  const e = c?.errors;
  if (!e) return '';
  if (typeof e['mensaje'] === 'string') return e['mensaje'];
  if (typeof e['servidor'] === 'string') return e['servidor'];
  if (e['noCoinciden']) return 'Las contraseñas no coinciden.';
  if (e['required']) return 'Este campo es obligatorio.';
  return 'Valor no válido.';
}

/** Coloca en el control el mensaje que el servidor devolvió para ese campo. */
export function errorServidor(c: AbstractControl | null, mensaje: string) {
  c?.setErrors({ ...(c.errors ?? {}), servidor: mensaje });
  c?.markAsTouched();
}

/** Texto recortado o null si quedó vacío (campos opcionales del contrato). */
export function textoONull(v: unknown): string | null {
  const t = String(v ?? '').trim();
  return t === '' ? null : t;
}
