import { inject, Injectable } from '@angular/core';
import { Api } from '@/app/core/api';
import type { Dashboard } from '@/app/tipos/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(Api);

  /** `ingresos` solo viene si el rol tiene `donaciones:leer` (se omite, no es null). */
  obtener() {
    return this.api.objeto<Dashboard>('/dashboard');
  }
}
