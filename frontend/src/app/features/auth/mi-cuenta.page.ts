import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormGroupDirective, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { errorDeCampo } from '@/app/core/api';
import { ETIQUETAS_ROL, formatearFechaHora } from '@/app/core/formato';
import { NotificarService } from '@/app/core/notificar.service';
import { SesionService } from '@/app/core/sesion.service';
import {
  coinciden,
  errorServidor,
  mensajeError,
  requerido,
  validarPassword,
} from '@/app/core/validadores';
import { PageHeader } from '@/app/compartido/page-header';
import { AuthService } from './auth.service';

type Campo = 'passwordActual' | 'passwordNueva' | 'confirmacion';

@Component({
  selector: 'app-mi-cuenta',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatButton,
    PageHeader,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header titulo="Mi cuenta" />
    @if (usuario(); as u) {
      <div class="rejilla-2 ancho">
        <section class="tarjeta tarjeta-cuerpo">
          <h2 class="tarjeta-titulo">Mis datos</h2>
          <dl class="lista-datos">
            <dt>Nombre</dt>
            <dd>{{ u.nombre }}</dd>
            <dt>Correo</dt>
            <dd>{{ u.email }}</dd>
            <dt>Rol</dt>
            <dd>{{ etiquetasRol[u.rol] }}</dd>
            <dt>Último acceso</dt>
            <dd>{{ fechaHora(u.ultimoAcceso) }}</dd>
          </dl>
        </section>

        <section class="tarjeta tarjeta-cuerpo">
          <h2 class="tarjeta-titulo">Cambiar contraseña</h2>
          <form
            [formGroup]="form"
            (ngSubmit)="enviar(dir)"
            #dir="ngForm"
            novalidate
            class="columna"
          >
            <mat-form-field>
              <mat-label>Contraseña actual</mat-label>
              <input
                matInput
                type="password"
                autocomplete="current-password"
                formControlName="passwordActual"
              />
              <mat-error>{{ error('passwordActual') }}</mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Contraseña nueva</mat-label>
              <input
                matInput
                type="password"
                autocomplete="new-password"
                formControlName="passwordNueva"
              />
              <mat-hint>Mínimo 8 caracteres, con al menos una letra y un número.</mat-hint>
              <mat-error>{{ error('passwordNueva') }}</mat-error>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Confirmar contraseña nueva</mat-label>
              <input
                matInput
                type="password"
                autocomplete="new-password"
                formControlName="confirmacion"
              />
              <mat-error>{{ error('confirmacion') }}</mat-error>
            </mat-form-field>
            <button matButton="filled" type="submit" class="boton" [disabled]="enviando()">
              {{ enviando() ? 'Actualizando…' : 'Actualizar contraseña' }}
            </button>
          </form>
        </section>
      </div>
    }
  `,
  styles: `
    .ancho {
      max-width: 56rem;
    }
    .boton {
      align-self: flex-start;
    }
  `,
})
export class MiCuentaPage {
  private readonly auth = inject(AuthService);
  private readonly notificar = inject(NotificarService);
  protected readonly usuario = inject(SesionService).usuario;
  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly fechaHora = formatearFechaHora;
  protected readonly enviando = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      passwordActual: ['', requerido('Escribe tu contraseña actual.')],
      passwordNueva: ['', validarPassword],
      confirmacion: [''],
    },
    { validators: coinciden('passwordNueva', 'confirmacion') },
  );

  protected error(campo: Campo) {
    return mensajeError(this.form.controls[campo]);
  }

  protected enviar(dir: FormGroupDirective) {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { passwordActual, passwordNueva } = this.form.getRawValue();
    this.enviando.set(true);
    this.auth.cambiarPassword(passwordActual, passwordNueva).subscribe({
      next: () => {
        this.enviando.set(false);
        dir.resetForm();
        this.notificar.exito('Contraseña actualizada');
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        const conError = (['passwordActual', 'passwordNueva'] as const).find((c) =>
          errorDeCampo(e, c),
        );
        if (conError) errorServidor(this.form.controls[conError], errorDeCampo(e, conError)!);
        else this.notificar.error(e);
      },
    });
  }
}
