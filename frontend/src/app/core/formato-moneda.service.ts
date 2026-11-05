import { inject, Injectable } from '@angular/core';
import { ConfiguracionService } from '@/app/features/configuracion/configuracion.service';
import { formatearMoneda } from './formato';

/**
 * Formateador de montos con la moneda de la configuración de la iglesia (AGENTS.md §4 UX).
 * @example readonly moneda = inject(FormatoMonedaService); moneda.formato(donacion.monto)  // "$1,500.00"
 */
@Injectable({ providedIn: 'root' })
export class FormatoMonedaService {
  private readonly configuracion = inject(ConfiguracionService);

  constructor() {
    this.configuracion.cargar();
  }

  /** Código de moneda vigente (MXN mientras carga) */
  codigo() {
    return this.configuracion.actual()?.moneda ?? 'MXN';
  }

  formato = (monto: string | number | null | undefined) => formatearMoneda(monto, this.codigo());
}
