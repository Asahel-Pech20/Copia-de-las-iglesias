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
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { format } from 'date-fns';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { errorDeCampo, normalizarError } from '@/app/core/api';
import type { ConCambiosSinGuardar } from '@/app/core/cambios-sin-guardar';
import {
  aFechaApi,
  ETIQUETAS_CATEGORIA_EVENTO,
  ETIQUETAS_TIPO_EVENTO,
  opcionesDe,
} from '@/app/core/formato';
import { NotificarService } from '@/app/core/notificar.service';
import { valorDe } from '@/app/core/recurso';
import { SesionService } from '@/app/core/sesion.service';
import { errorServidor, maximo, mensajeError, requerido, textoONull } from '@/app/core/validadores';
import { EstadoError, Esqueleto } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import { ConfiguracionService } from '@/app/features/configuracion/configuracion.service';
import { MinisteriosService } from '@/app/features/ministerios/ministerios.service';
import type {
  CategoriaEvento,
  EventoDetalle,
  GuardarEvento,
  TipoEvento,
} from '@/app/tipos/eventos';
import { EventosService } from './eventos.service';
import { PermisosMinisterioService } from './permisos-ministerio.service';

const hora = (iso: string) => format(new Date(iso), 'HH:mm');

type Campo =
  | 'titulo'
  | 'tipo'
  | 'categoria'
  | 'fecha'
  | 'horaInicio'
  | 'horaFin'
  | 'lugar'
  | 'descripcion'
  | 'ministerioId';

/** /eventos/nuevo (acepta ?fecha= y ?ministerioId=) y /eventos/:id/editar (F3-02). */
@Component({
  selector: 'app-evento-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    LucideAngularModule,
    PageHeader,
    EstadoError,
    Esqueleto,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evento-form.page.html',
  styles: `
    .rejilla {
      display: grid;
      gap: 4px 16px;
      padding: 16px;
    }
    .horas {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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
export class EventoFormPage implements ConCambiosSinGuardar {
  /** Parámetro :id de la ruta (vacío en /eventos/nuevo) */
  readonly id = input<string>();
  /** ?fecha=yyyy-MM-dd y ?ministerioId= al crear desde el calendario o desde un ministerio */
  readonly fecha = input<string>();
  readonly ministerioId = input<string>();

  private readonly servicio = inject(EventosService);
  private readonly sesion = inject(SesionService);
  private readonly permisos = inject(PermisosMinisterioService);
  private readonly ministeriosService = inject(MinisteriosService);
  private readonly configuracion = inject(ConfiguracionService);
  private readonly notificar = inject(NotificarService);
  private readonly router = inject(Router);

  protected readonly consulta = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.servicio.obtener(params),
  });
  protected readonly evento = computed<EventoDetalle | undefined>(() =>
    this.id() ? valorDe(this.consulta) : undefined,
  );
  private readonly ministeriosRecurso = rxResource({
    stream: () => this.ministeriosService.listar({ limit: 100 }),
  });
  private readonly horarios = rxResource({ stream: () => this.configuracion.listarHorarios() });

  /** COORDINADOR (solo "-propio"): el ministerio es obligatorio y solo puede elegir los suyos */
  protected readonly completo = computed(() =>
    this.sesion.puede(this.id() ? 'eventos:editar' : 'eventos:crear'),
  );
  protected readonly opcionesMinisterio = computed(() =>
    (valorDe(this.ministeriosRecurso)?.data ?? [])
      .filter((m) => this.completo() || this.permisos.coordinados().includes(m.id))
      .map((m) => ({ valor: m.id, etiqueta: m.nombre })),
  );
  /** Lugares sugeridos: los de los horarios de reunión configurados */
  protected readonly lugares = computed(() => [
    ...new Set(
      (valorDe(this.horarios) ?? []).map((h) => h.lugar).filter((l): l is string => Boolean(l)),
    ),
  ]);

  protected readonly titulo = computed(() => (this.id() ? 'Editar evento' : 'Nuevo evento'));
  protected readonly volver = computed(() => (this.id() ? ['/eventos', this.id()!] : ['/eventos']));
  protected readonly opcionesTipo = opcionesDe(ETIQUETAS_TIPO_EVENTO);
  protected readonly opcionesCategoria = opcionesDe(ETIQUETAS_CATEGORIA_EVENTO);
  protected readonly enviando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly iconoVolver = ArrowLeft;
  private guardado = false;

  private readonly horaFinPosterior: ValidatorFn = (
    c: AbstractControl,
  ): ValidationErrors | null => {
    const inicio = c.parent?.get('horaInicio')?.value as string | undefined;
    return c.value && inicio && c.value < inicio
      ? { mensaje: 'La hora de fin debe ser igual o posterior a la de inicio.' }
      : null;
  };
  private readonly ministerioObligatorio: ValidatorFn = (c) =>
    !this.completo() && !c.value
      ? { mensaje: 'Elige uno de los ministerios que coordinas.' }
      : null;

  protected readonly form = inject(NonNullableFormBuilder).group({
    titulo: ['', [requerido('Escribe el título.'), maximo(150)]],
    tipo: ['RELIGIOSO' as TipoEvento, requerido('Selecciona el tipo.')],
    categoria: ['CULTO' as CategoriaEvento, requerido('Selecciona la categoría.')],
    fecha: [aFechaApi(new Date()), requerido('Selecciona la fecha.')],
    horaInicio: ['10:00', requerido('Selecciona la hora de inicio.')],
    horaFin: ['', this.horaFinPosterior],
    lugar: ['', [requerido('Escribe el lugar.'), maximo(150)]],
    descripcion: ['', maximo(2000)],
    ministerioId: ['', this.ministerioObligatorio],
  });

  constructor() {
    // Valores iniciales desde la URL al crear
    effect(() => {
      if (this.id()) return;
      const fecha = this.fecha();
      const ministerioId = this.ministerioId();
      if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) this.form.controls.fecha.setValue(fecha);
      if (ministerioId) this.form.controls.ministerioId.setValue(ministerioId);
    });
    // Al editar, se llena con el evento cargado
    effect(() => {
      const e = this.evento();
      if (!e) return;
      this.form.reset({
        titulo: e.titulo,
        tipo: e.tipo,
        categoria: e.categoria,
        fecha: aFechaApi(new Date(e.fechaInicio)),
        horaInicio: hora(e.fechaInicio),
        horaFin: e.fechaFin ? hora(e.fechaFin) : '',
        lugar: e.lugar,
        descripcion: e.descripcion ?? '',
        ministerioId: e.ministerio?.id ?? '',
      });
    });
    // "Ministerio obligatorio" depende del permiso; la hora de fin, de la de inicio
    effect(() => {
      this.completo();
      this.form.controls.ministerioId.updateValueAndValidity();
    });
    this.form.controls.horaInicio.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.horaFin.updateValueAndValidity());
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
    const datos: GuardarEvento = {
      titulo: v.titulo.trim(),
      tipo: v.tipo,
      categoria: v.categoria,
      fechaInicio: new Date(`${v.fecha}T${v.horaInicio}`).toISOString(),
      fechaFin: v.horaFin ? new Date(`${v.fecha}T${v.horaFin}`).toISOString() : null,
      lugar: v.lugar.trim(),
      descripcion: textoONull(v.descripcion),
      ministerioId: v.ministerioId || null,
    };
    this.errorGeneral.set(null);
    this.enviando.set(true);
    const id = this.id();
    const peticion = id ? this.servicio.editar(id, datos) : this.servicio.crear(datos);
    peticion.subscribe({
      next: (guardado) => {
        this.guardado = true;
        this.notificar.exito('Evento guardado');
        void this.router.navigate(['/eventos', guardado.id]);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        // Errores de campo del backend van a su campo; fechaInicio/fechaFin se muestran en las horas
        const campos: [string, Campo][] = [
          ['titulo', 'titulo'],
          ['lugar', 'lugar'],
          ['descripcion', 'descripcion'],
          ['fechaInicio', 'horaInicio'],
          ['fechaFin', 'horaFin'],
          ['ministerioId', 'ministerioId'],
        ];
        const conCampo = campos.filter(([api, campo]) => {
          const mensaje = errorDeCampo(e, api);
          if (mensaje) errorServidor(this.form.controls[campo], mensaje);
          return Boolean(mensaje);
        });
        if (conCampo.length === 0) this.errorGeneral.set(normalizarError(e).message);
      },
    });
  }
}
