import { inject, Injectable, signal } from '@angular/core';
import { map, tap } from 'rxjs';
import { Api } from '@/app/core/api';
import type {
  Donacion,
  GuardarDonacion,
  QueryDonaciones,
  QueryResumenIngresos,
  RespuestaListaDonaciones,
  ResumenIngresos,
  ResumenMensual,
} from '@/app/tipos/donaciones';

/** Servicio de donaciones (F4). Los montos viajan como string ("1500.00"). */
@Injectable({ providedIn: 'root' })
export class DonacionesService {
  private readonly api = inject(Api);

  /** Sube con cada alta, edición o anulación; las listas y resúmenes lo leen para recargarse. */
  readonly version = signal(0);
  private readonly cambio = () => this.version.update((v) => v + 1);

  /** `meta.totalMonto` trae la suma del filtro completo (sin anuladas). */
  listar(query: QueryDonaciones) {
    return this.api
      .lista<Donacion>('/donaciones', { ...query })
      .pipe(map((res) => res as RespuestaListaDonaciones));
  }

  obtener(id: string) {
    return this.api.objeto<Donacion>(`/donaciones/${id}`);
  }

  crear(datos: GuardarDonacion) {
    return this.api.post<Donacion>('/donaciones', datos).pipe(tap(this.cambio));
  }

  editar(id: string, datos: Partial<GuardarDonacion>) {
    return this.api.patch<Donacion>(`/donaciones/${id}`, datos).pipe(tap(this.cambio));
  }

  anular(id: string, motivo: string) {
    return this.api.patch<Donacion>(`/donaciones/${id}/anular`, { motivo }).pipe(tap(this.cambio));
  }

  resumenIngresos(query: QueryResumenIngresos) {
    return this.api.objeto<ResumenIngresos>('/donaciones/resumen', { ...query });
  }

  resumenMensual(query: { anio: number; mes: number }) {
    return this.api.objeto<ResumenMensual>('/donaciones/resumen-mensual', { ...query });
  }
}
