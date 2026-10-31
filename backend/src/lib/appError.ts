// Códigos de error del contrato (specs.md §7.1)
export type CodigoError =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export interface DetalleError {
  campo?: string;
  mensaje: string;
}

// Error de dominio: los services lo lanzan y el middleware errores.ts lo traduce a JSON
export class AppError extends Error {
  constructor(
    public readonly code: CodigoError,
    message: string,
    public readonly status: number,
    public readonly details?: DetalleError[],
  ) {
    super(message);
    this.name = 'AppError';
  }

  static validacion(message: string, details?: DetalleError[]) {
    return new AppError('VALIDATION_ERROR', message, 400, details);
  }
  static noAutenticado(message = 'Debes iniciar sesión.') {
    return new AppError('UNAUTHENTICATED', message, 401);
  }
  static prohibido(message = 'No tienes permiso para realizar esta acción.') {
    return new AppError('FORBIDDEN', message, 403);
  }
  static noEncontrado(message = 'El recurso solicitado no existe.') {
    return new AppError('NOT_FOUND', message, 404);
  }
  static conflicto(message: string) {
    return new AppError('CONFLICT', message, 409);
  }
  static reglaNegocio(message: string) {
    return new AppError('BUSINESS_RULE', message, 422);
  }
}
