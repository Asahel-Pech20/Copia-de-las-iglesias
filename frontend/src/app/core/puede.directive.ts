import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import type { Permiso } from '@/app/tipos/comunes';
import { SesionService } from './sesion.service';

/**
 * Muestra su contenido solo si el usuario tiene el permiso. Ocultar no es seguridad:
 * el backend valida siempre (AGENTS.md regla 2). Equivale a <Puede> de React.
 * @example <button *appPuede="'miembros:crear'">Nuevo miembro</button>
 */
@Directive({ selector: '[appPuede]' })
export class PuedeDirective {
  readonly appPuede = input.required<Permiso | Permiso[]>();
  private readonly sesion = inject(SesionService);
  private readonly plantilla = inject(TemplateRef);
  private readonly vista = inject(ViewContainerRef);
  private visible = false;

  constructor() {
    effect(() => {
      const permitido = this.sesion.puede(...[this.appPuede()].flat());
      if (permitido && !this.visible) this.vista.createEmbeddedView(this.plantilla);
      if (!permitido && this.visible) this.vista.clear();
      this.visible = permitido;
    });
  }
}
