import { inject, Injectable } from '@angular/core';
import { Api } from '@/app/core/api';

/** Endpoints de auth que no cambian la sesión (la sesión vive en SesionService). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);

  solicitarRecuperacion(email: string) {
    return this.api.post<void>('/auth/forgot-password', { email });
  }

  restablecerPassword(token: string, password: string) {
    return this.api.post<void>('/auth/reset-password', { token, password });
  }

  cambiarPassword(passwordActual: string, passwordNueva: string) {
    return this.api.patch<void>('/auth/me/password', { passwordActual, passwordNueva });
  }
}
