import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type VarianteBadge = 'exito' | 'neutro' | 'peligro' | 'alerta' | 'primario';

/**
 * Badge de estado.
 * @example <app-badge-estado [activo]="miembro.activo" />
 * @example <app-badge-estado etiqueta="Coordinador" variante="primario" />
 */
@Component({
  selector: 'app-badge-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge ' + varianteFinal()">{{ texto() }}</span>`,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      border: 1px solid currentColor;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
      white-space: nowrap;
    }
    .exito {
      color: var(--exito);
    }
    .neutro {
      color: var(--texto-suave);
    }
    .peligro {
      color: var(--peligro);
    }
    .alerta {
      color: var(--alerta);
    }
    .primario {
      color: var(--primario);
    }
  `,
})
export class BadgeEstado {
  /** Atajo para entidades con soft delete: true = "Activo", false = "Inactivo" */
  readonly activo = input<boolean>();
  /** Etiqueta libre; tiene prioridad sobre `activo` */
  readonly etiqueta = input<string>();
  readonly variante = input<VarianteBadge>();
  protected readonly texto = computed(
    () => this.etiqueta() ?? (this.activo() ? 'Activo' : 'Inactivo'),
  );
  protected readonly varianteFinal = computed(
    () => this.variante() ?? (this.activo() ? 'exito' : 'neutro'),
  );
}
