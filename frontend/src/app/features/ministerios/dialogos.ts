import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { errorDeCampo, normalizarError } from '@/app/core/api';
import { valorDe } from '@/app/core/recurso';
import { ETIQUETAS_ROL } from '@/app/core/formato';
import { NotificarService } from '@/app/core/notificar.service';
import { errorServidor, maximo, mensajeError, requerido, textoONull } from '@/app/core/validadores';
import { SelectorMiembros } from '@/app/features/miembros/selector-miembros';
import { UsuariosService } from '@/app/features/usuarios/usuarios.service';
import type { Rol } from '@/app/tipos/comunes';
import type { Ministerio } from '@/app/tipos/ministerios';
import { MinisteriosService } from './ministerios.service';

const ACCIONES = [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton];

/** Modal crear/editar ministerio (F2-08). El 409 por nombre duplicado se muestra en el campo. */
@Component({
  selector: 'app-ministerio-form-dialogo',
  imports: [...ACCIONES, ReactiveFormsModule, MatFormField, MatLabel, MatError, MatInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ ministerio ? 'Editar ministerio' : 'Nuevo ministerio' }}</h2>
    <mat-dialog-content>
      <p class="texto-suave">
        Los coordinadores y los integrantes se gestionan desde el detalle del ministerio.
      </p>
      <form
        id="form-ministerio"
        [formGroup]="form"
        (ngSubmit)="enviar()"
        novalidate
        class="columna"
      >
        @if (errorGeneral()) {
          <p class="alerta alerta-peligro" role="alert">{{ errorGeneral() }}</p>
        }
        <mat-form-field>
          <mat-label>Nombre</mat-label>
          <input matInput autocomplete="off" formControlName="nombre" required />
          <mat-error>{{ error('nombre') }}</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Descripción</mat-label>
          <textarea matInput rows="3" formControlName="descripcion"></textarea>
          <mat-error>{{ error('descripcion') }}</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton="outlined" type="button" (click)="ref.close(false)">Cancelar</button>
      <button matButton="filled" type="submit" form="form-ministerio" [disabled]="enviando()">
        {{ enviando() ? 'Guardando…' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class MinisterioFormDialogo {
  protected readonly ministerio = inject<Ministerio | null>(MAT_DIALOG_DATA, { optional: true });
  protected readonly ref = inject(MatDialogRef<MinisterioFormDialogo, boolean>);
  private readonly servicio = inject(MinisteriosService);
  private readonly notificar = inject(NotificarService);
  protected readonly enviando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: [this.ministerio?.nombre ?? '', [requerido('Escribe el nombre.'), maximo(80)]],
    descripcion: [this.ministerio?.descripcion ?? '', maximo(500)],
  });

  protected error(campo: 'nombre' | 'descripcion') {
    return mensajeError(this.form.controls[campo]);
  }

  protected enviar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.errorGeneral.set(null);
    this.enviando.set(true);
    this.servicio
      .guardar(
        { nombre: v.nombre.trim(), descripcion: textoONull(v.descripcion) },
        this.ministerio?.id,
      )
      .subscribe({
        next: () => {
          this.notificar.exito(this.ministerio ? 'Ministerio actualizado' : 'Ministerio creado');
          this.ref.close(true);
        },
        error: (e: unknown) => {
          this.enviando.set(false);
          const errorNombre = errorDeCampo(e, 'nombre');
          if (errorNombre) errorServidor(this.form.controls.nombre, errorNombre);
          else this.errorGeneral.set(normalizarError(e).message);
        },
      });
  }
}

/**
 * Selección múltiple de usuarios activos COORDINADOR o PASTOR (F2-09). Reemplaza la lista.
 * Se abre con los coordinadores actuales marcados.
 */
@Component({
  selector: 'app-coordinadores-dialogo',
  imports: [...ACCIONES, MatCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Coordinadores de {{ ministerio.nombre }}</h2>
    <mat-dialog-content>
      <p class="texto-suave">
        Solo usuarios activos con rol Coordinador o Pastor. Podrán gestionar los integrantes y las
        actividades de este ministerio.
      </p>
      @if (errorGeneral()) {
        <p class="alerta alerta-peligro" role="alert">{{ errorGeneral() }}</p>
      }
      @if (opciones.isLoading()) {
        <p class="texto-suave">Cargando usuarios…</p>
      } @else if (opciones.error()) {
        <p class="alerta alerta-peligro" role="alert">{{ mensaje(opciones.error()) }}</p>
      } @else if (candidatos().length === 0) {
        <p class="texto-suave">No hay usuarios activos con rol Coordinador o Pastor.</p>
      } @else {
        <fieldset class="lista">
          <legend class="sr-only">Usuarios disponibles</legend>
          @for (u of candidatos(); track u.id) {
            <mat-checkbox [checked]="seleccion().includes(u.id)" (change)="alternar(u.id)">
              {{ u.nombre }} <span class="texto-suave pequeno">{{ rol(u.rol) }}</span>
            </mat-checkbox>
          }
        </fieldset>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton="outlined" type="button" (click)="ref.close(false)">Cancelar</button>
      <button
        matButton="filled"
        type="button"
        [disabled]="guardando() || opciones.isLoading()"
        (click)="guardar()"
      >
        {{ guardando() ? 'Guardando…' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .lista {
      display: flex;
      max-height: 18rem;
      flex-direction: column;
      overflow-y: auto;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .pequeno {
      margin-left: 8px;
      font-size: 12px;
    }
  `,
})
export class CoordinadoresDialogo {
  protected readonly ministerio = inject<Ministerio>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<CoordinadoresDialogo, boolean>);
  private readonly servicio = inject(MinisteriosService);
  private readonly usuarios = inject(UsuariosService);
  private readonly notificar = inject(NotificarService);
  // GET /usuarios/opciones (B1) acepta un solo rol: se piden todos y se filtran aquí
  protected readonly opciones = rxResource({ stream: () => this.usuarios.opciones() });
  protected readonly candidatos = computed(() =>
    (valorDe(this.opciones) ?? []).filter((u) => u.rol === 'COORDINADOR' || u.rol === 'PASTOR'),
  );
  protected readonly seleccion = signal(this.ministerio.coordinadores.map((c) => c.id));
  protected readonly guardando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  protected rol(rol: Rol) {
    return ETIQUETAS_ROL[rol];
  }

  protected mensaje(error: unknown) {
    return normalizarError(error).message;
  }

  protected alternar(id: string) {
    this.seleccion.update((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  protected guardar() {
    this.errorGeneral.set(null);
    this.guardando.set(true);
    this.servicio.asignarCoordinadores(this.ministerio.id, this.seleccion()).subscribe({
      next: () => {
        this.notificar.exito('Coordinadores actualizados');
        this.ref.close(true);
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.errorGeneral.set(normalizarError(e).message);
      },
    });
  }
}

/** "Agregar integrantes" con SelectorMiembros múltiple, sin ofrecer a los actuales (F2-10). */
@Component({
  selector: 'app-agregar-integrantes-dialogo',
  imports: [...ACCIONES, SelectorMiembros],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Agregar integrantes</h2>
    <mat-dialog-content>
      <p class="texto-suave">
        Busca y selecciona los miembros activos que se unirán a {{ ministerio.nombre }}.
      </p>
      @if (errorGeneral()) {
        <p class="alerta alerta-peligro" role="alert">{{ errorGeneral() }}</p>
      }
      <app-selector-miembros
        etiqueta="Miembros"
        [multiple]="true"
        [(seleccion)]="seleccion"
        [excluirIds]="actualesIds()"
      />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton="outlined" type="button" (click)="ref.close(false)">Cancelar</button>
      <button
        matButton="filled"
        type="button"
        [disabled]="seleccion().length === 0 || guardando()"
        (click)="guardar()"
      >
        {{ guardando() ? 'Agregando…' : 'Agregar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class AgregarIntegrantesDialogo {
  protected readonly ministerio = inject<Ministerio>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<AgregarIntegrantesDialogo, boolean>);
  private readonly servicio = inject(MinisteriosService);
  private readonly notificar = inject(NotificarService);
  private readonly actuales = rxResource({
    stream: () => this.servicio.listarIntegrantes(this.ministerio.id, { limit: 100 }),
  });
  protected readonly actualesIds = computed(() =>
    (valorDe(this.actuales)?.data ?? []).map((i) => i.id),
  );
  protected readonly seleccion = signal<string[]>([]);
  protected readonly guardando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  protected guardar() {
    const ids = this.seleccion();
    this.errorGeneral.set(null);
    this.guardando.set(true);
    this.servicio.vincularMiembros(this.ministerio.id, ids).subscribe({
      next: () => {
        this.notificar.exito(
          ids.length === 1 ? 'Integrante agregado' : `${ids.length} integrantes agregados`,
        );
        this.ref.close(true);
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.errorGeneral.set(normalizarError(e).message);
      },
    });
  }
}
