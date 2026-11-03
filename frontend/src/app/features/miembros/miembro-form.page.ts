import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  type AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { map } from 'rxjs';
import { errorDeCampo, normalizarError } from '@/app/core/api';
import { valorDe } from '@/app/core/recurso';
import type { ConCambiosSinGuardar } from '@/app/core/cambios-sin-guardar';
import { aFechaApi } from '@/app/core/formato';
import { NotificarService } from '@/app/core/notificar.service';
import {
  errorServidor,
  maximo,
  mensajeError,
  requerido,
  textoONull,
  validarEmail,
} from '@/app/core/validadores';
import { EstadoError, Esqueleto } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import type { CrearMiembro, MiembroDetalle } from '@/app/tipos/miembros';
import { MiembrosService } from './miembros.service';

// Espejo de backend/src/modules/miembros/miembros.schemas.ts
const noFutura =
  (mensaje: string): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null =>
    c.value && String(c.value) > aFechaApi(new Date()) ? { mensaje } : null;

const validarTelefono: ValidatorFn = (c) => {
  const v = String(c.value ?? '').trim();
  return v === '' || /^\+?\d{7,15}$/.test(v.replace(/[\s-]/g, ''))
    ? null
    : { mensaje: 'El teléfono debe tener de 7 a 15 dígitos.' };
};

const CAMPOS = [
  'nombre',
  'apellidos',
  'fechaIngreso',
  'telefono',
  'email',
  'fechaNacimiento',
  'direccion',
  'notas',
] as const;
type Campo = (typeof CAMPOS)[number];

/** Estado de navegación que recibe el perfil tras crear un posible duplicado */
export interface EstadoPerfilMiembro {
  duplicadoId?: string;
}

/** /miembros/nuevo y /miembros/:id/editar (F2-02). */
@Component({
  selector: 'app-miembro-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatButton,
    LucideAngularModule,
    PageHeader,
    EstadoError,
    Esqueleto,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './miembro-form.page.html',
  styles: `
    .rejilla {
      display: grid;
      gap: 4px 16px;
      padding: 16px;
    }
    @media (min-width: 640px) {
      .rejilla {
        grid-template-columns: 1fr 1fr;
        padding: 24px;
      }
      .doble {
        grid-column: span 2;
      }
    }
    .botones {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `,
})
export class MiembroFormPage implements ConCambiosSinGuardar {
  /** Parámetro :id de la ruta (vacío en /miembros/nuevo) */
  readonly id = input<string>();
  private readonly servicio = inject(MiembrosService);
  private readonly notificar = inject(NotificarService);
  private readonly router = inject(Router);

  protected readonly consulta = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.servicio.obtener(params),
  });
  protected readonly miembro = computed<MiembroDetalle | undefined>(() =>
    this.id() ? valorDe(this.consulta) : undefined,
  );
  protected readonly titulo = computed(() => (this.id() ? 'Editar miembro' : 'Nuevo miembro'));
  protected readonly volver = computed(() =>
    this.id() ? ['/miembros', this.id()!] : ['/miembros'],
  );
  protected readonly enviando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly iconoVolver = ArrowLeft;
  // true tras guardar: ya no se pregunta al salir
  private guardado = false;

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [requerido('Escribe el nombre.'), maximo(80)]],
    apellidos: ['', [requerido('Escribe los apellidos.'), maximo(120)]],
    fechaIngreso: [
      aFechaApi(new Date()),
      [
        requerido('Selecciona la fecha de ingreso.'),
        noFutura('La fecha de ingreso no puede ser futura.'),
      ],
    ],
    telefono: ['', [validarTelefono, maximo(30)]],
    email: ['', [validarEmail, maximo(254)]],
    fechaNacimiento: ['', noFutura('La fecha de nacimiento no puede ser futura.')],
    direccion: ['', maximo(250)],
    notas: ['', maximo(1000)],
  });

  constructor() {
    effect(() => {
      const m = this.miembro();
      if (!m) return;
      this.form.reset({
        nombre: m.nombre,
        apellidos: m.apellidos,
        fechaIngreso: m.fechaIngreso,
        telefono: m.telefono ?? '',
        email: m.email ?? '',
        fechaNacimiento: m.fechaNacimiento ?? '',
        direccion: m.direccion ?? '',
        notas: m.notas ?? '',
      });
    });
  }

  tieneCambiosSinGuardar() {
    return this.form.dirty && !this.guardado;
  }

  // Cerrar o recargar la pestaña con cambios también avisa
  @HostListener('window:beforeunload', ['$event'])
  protected alSalir(evento: BeforeUnloadEvent) {
    if (this.tieneCambiosSinGuardar()) evento.preventDefault();
  }

  protected error(campo: Campo) {
    return mensajeError(this.form.controls[campo]);
  }

  protected enviar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const datos: CrearMiembro = {
      nombre: v.nombre.trim(),
      apellidos: v.apellidos.trim(),
      fechaIngreso: v.fechaIngreso,
      telefono: textoONull(v.telefono),
      email: textoONull(v.email)?.toLowerCase() ?? null,
      fechaNacimiento: v.fechaNacimiento || null,
      direccion: textoONull(v.direccion),
      notas: textoONull(v.notas),
    };
    this.errorGeneral.set(null);
    this.enviando.set(true);
    const id = this.id();
    const peticion = id
      ? this.servicio.editar(id, datos).pipe(map(() => ({ destino: id, estado: {} })))
      : this.servicio.crear(datos).pipe(
          map((res) => ({
            destino: res.data.id,
            estado: (res.meta?.posibleDuplicado
              ? { duplicadoId: res.meta.duplicadoId }
              : {}) as EstadoPerfilMiembro,
          })),
        );

    peticion.subscribe({
      next: ({ destino, estado }) => {
        this.guardado = true;
        this.notificar.exito('Miembro guardado');
        void this.router.navigate(['/miembros', destino], { state: estado });
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        // Errores de campo del backend (400) van a su campo; el resto, arriba del formulario
        const conCampo = CAMPOS.filter((campo) => {
          const mensaje = errorDeCampo(e, campo);
          if (mensaje) errorServidor(this.form.controls[campo], mensaje);
          return Boolean(mensaje);
        });
        if (conCampo.length === 0) this.errorGeneral.set(normalizarError(e).message);
      },
    });
  }
}
