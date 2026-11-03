import type { HttpInterceptorFn } from '@angular/common/http';

// Producción: sin mocks (MSW no entra en el bundle)
export const INTERCEPTORES_MOCKS: HttpInterceptorFn[] = [];
