import type { HttpInterceptorFn } from '@angular/common/http';
import { USAR_MOCKS } from '@/app/core/config';
import { interceptorMocks } from './interceptor';

/** Desarrollo: los handlers de MSW responden el contrato. En producción se reemplaza por interceptores.prod.ts. */
export const INTERCEPTORES_MOCKS: HttpInterceptorFn[] = USAR_MOCKS ? [interceptorMocks] : [];
