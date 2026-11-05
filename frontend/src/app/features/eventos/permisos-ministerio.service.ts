import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { valorDe } from '@/app/core/recurso';
import { SesionService } from '@/app/core/sesion.service';
import { MinisteriosService } from '@/app/features/ministerios/ministerios.service';
import type { Permiso } from '@/app/tipos/comunes';

/**
 * Reglas "-propio" del COORDINADOR: ¿puede gestionar eventos/asistencia de ese ministerio?
 * Solo pide los ministerios si el rol tiene alguna variante "-propio"; el backend vuelve a validar.
 */
@Injectable({ providedIn: 'root' })
export class PermisosMinisterioService {
  private readonly sesion = inject(SesionService);
  private readonly ministerios = inject(MinisteriosService);

  private readonly recurso = rxResource({
    params: () => {
      const usuarioId = this.sesion.usuario()?.id;
      const esCoordinador = this.sesion.puede(
        'eventos:crear-propio',
        'eventos:editar-propio',
        'asistencia:leer-propio',
      );
      return usuarioId && esCoordinador ? usuarioId : undefined;
    },
    stream: () => this.ministerios.listar({ limit: 100 }),
  });

  /** Ids de los ministerios que coordina el usuario actual */
  readonly coordinados = computed(() => {
    const yo = this.sesion.usuario()?.id;
    return (valorDe(this.recurso)?.data ?? [])
      .filter((m) => m.coordinadores.some((c) => c.id === yo))
      .map((m) => m.id);
  });

  /** Permiso completo siempre; la variante "-propio" solo en los ministerios que coordina. */
  puede(completo: Permiso, propio: Permiso, ministerioId: string | null | undefined) {
    return (
      this.sesion.puede(completo) ||
      (this.sesion.puede(propio) &&
        Boolean(ministerioId) &&
        this.coordinados().includes(ministerioId as string))
    );
  }
}
