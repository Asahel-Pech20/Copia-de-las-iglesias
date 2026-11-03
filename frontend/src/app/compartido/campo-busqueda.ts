import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { LucideAngularModule, Search } from 'lucide-angular';

/** Búsqueda con debounce de 300 ms (AGENTS.md §4 UX). */
@Component({
  selector: 'app-campo-busqueda',
  imports: [MatFormField, MatLabel, MatInput, MatPrefix, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-form-field class="busqueda" subscriptSizing="dynamic">
      <mat-label>{{ etiqueta() ?? placeholder() }}</mat-label>
      <lucide-icon matPrefix [img]="icono" [size]="16" class="lupa" aria-hidden="true" />
      <input matInput type="search" [value]="texto()" (input)="escribir($event)" />
    </mat-form-field>
  `,
  styles: `
    .busqueda {
      width: 100%;
    }
    @media (min-width: 640px) {
      .busqueda {
        max-width: 20rem;
      }
    }
    .lupa {
      margin: 0 4px 0 12px;
      color: var(--texto-suave);
    }
  `,
})
export class CampoBusqueda {
  readonly valor = input('');
  readonly placeholder = input('Buscar…');
  readonly etiqueta = input<string>();
  readonly demoraMs = input(300);
  /** Se emite 300 ms después de que el usuario deja de escribir */
  readonly cambio = output<string>();

  protected readonly texto = signal('');
  protected readonly icono = Search;
  private ultimoEnviado = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // Si el valor cambia desde fuera (p. ej. la URL), se sincroniza
    effect(() => {
      const externo = this.valor();
      untracked(() => {
        if (externo !== this.ultimoEnviado) {
          this.ultimoEnviado = externo;
          this.texto.set(externo);
        }
      });
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  protected escribir(evento: Event) {
    const valor = (evento.target as HTMLInputElement).value;
    this.texto.set(valor);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      if (valor === this.ultimoEnviado) return;
      this.ultimoEnviado = valor;
      this.cambio.emit(valor);
    }, this.demoraMs());
  }
}
