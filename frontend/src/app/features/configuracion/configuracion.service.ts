import { HttpClient, HttpEventType } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { filter, map, type Observable, tap } from 'rxjs';
import { Api } from '@/app/core/api';
import { API_URL } from '@/app/core/config';
import type { RespuestaObjeto } from '@/app/tipos/comunes';
import type {
  ConfiguracionIglesia,
  EditarConfiguracion,
  GuardarHorario,
  HorarioReunion,
} from '@/app/tipos/configuracion';
import { MAX_LOGO_BYTES, TIPOS_LOGO } from './catalogos';

/** Avance de la subida del logo: porcentaje mientras sube y la configuración al terminar. */
export type AvanceLogo = { porcentaje: number } | { config: ConfiguracionIglesia };

/** Valida el archivo del logo antes de subirlo; devuelve el mensaje de error o null. */
export function validarLogo(archivo: File): string | null {
  if (!(TIPOS_LOGO as readonly string[]).includes(archivo.type)) {
    return 'Formato no permitido. Usa PNG, JPG, WEBP o SVG.';
  }
  if (archivo.size > MAX_LOGO_BYTES) return 'El archivo supera 2 MB.';
  return null;
}

/**
 * Configuración global de la iglesia (nombre, logo, moneda…). La usan el layout, el login y
 * los formatos de moneda; se guarda en una señal compartida para no pedirla en cada pantalla.
 */
@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly api = inject(Api);
  private readonly http = inject(HttpClient);
  private pedida = false;

  /** null mientras carga (o si falló: el layout usa el nombre por defecto) */
  readonly actual = signal<ConfiguracionIglesia | null>(null);

  /** Carga la configuración una sola vez (o de nuevo con `forzar`). */
  cargar(forzar = false) {
    if (this.pedida && !forzar) return;
    this.pedida = true;
    this.api.objeto<ConfiguracionIglesia>('/configuracion').subscribe({
      next: (config) => this.actual.set(config),
      error: () => {
        this.pedida = false;
      },
    });
  }

  obtener() {
    return this.api.objeto<ConfiguracionIglesia>('/configuracion');
  }

  actualizar(datos: EditarConfiguracion) {
    return this.api
      .put<ConfiguracionIglesia>('/configuracion', datos)
      .pipe(tap((config) => this.actual.set(config)));
  }

  subirLogo(archivo: File): Observable<AvanceLogo> {
    const form = new FormData();
    form.append('logo', archivo);
    return this.http
      .post<RespuestaObjeto<ConfiguracionIglesia>>(`${API_URL}/configuracion/logo`, form, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        filter((e) => e.type === HttpEventType.UploadProgress || e.type === HttpEventType.Response),
        map((e): AvanceLogo => {
          if (e.type === HttpEventType.Response) return { config: e.body!.data };
          const total = e.type === HttpEventType.UploadProgress ? e.total : undefined;
          const cargado = e.type === HttpEventType.UploadProgress ? e.loaded : 0;
          return { porcentaje: total ? Math.round((cargado / total) * 100) : 0 };
        }),
        tap((avance) => {
          if ('config' in avance) this.actual.set(avance.config);
        }),
      );
  }

  listarHorarios() {
    return this.api.objeto<HorarioReunion[]>('/configuracion/horarios');
  }

  guardarHorario(datos: GuardarHorario, id?: string) {
    return id
      ? this.api.patch<HorarioReunion>(`/configuracion/horarios/${id}`, datos)
      : this.api.post<HorarioReunion>('/configuracion/horarios', datos);
  }

  eliminarHorario(id: string) {
    return this.api.delete(`/configuracion/horarios/${id}`);
  }
}
