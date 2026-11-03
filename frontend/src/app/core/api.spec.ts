import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { errorDeCampo, esErrorApi, normalizarError } from './api';

describe('core/api', () => {
  it('normaliza el error del contrato { error: { code, message, details } }', () => {
    const http = new HttpErrorResponse({
      status: 409,
      error: {
        error: {
          code: 'CONFLICT',
          message: 'El correo ya está registrado.',
          details: [{ campo: 'email', mensaje: 'Duplicado' }],
        },
      },
    });
    const e = normalizarError(http);
    expect(e).toEqual({
      status: 409,
      code: 'CONFLICT',
      message: 'El correo ya está registrado.',
      details: [{ campo: 'email', mensaje: 'Duplicado' }],
    });
    expect(esErrorApi(e)).toBe(true);
    expect(errorDeCampo(e, 'email')).toBe('Duplicado');
  });

  it('sin respuesta del servidor es NETWORK_ERROR', () => {
    expect(normalizarError(new HttpErrorResponse({ status: 0 })).code).toBe('NETWORK_ERROR');
  });

  it('un error desconocido es INTERNAL_ERROR y un HttpErrorResponse no es ErrorApi', () => {
    expect(normalizarError(new Error('x')).code).toBe('INTERNAL_ERROR');
    expect(esErrorApi(new HttpErrorResponse({ status: 500 }))).toBe(false);
  });
});
