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
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { RouterLink } from '@angular/router';
import { ArrowLeft, Ban, Check, CheckCheck, LucideAngularModule, Save, X } from 'lucide-angular';
import { normalizarError } from '@/app/core/api';
import type { ConCambiosSinGuardar } from '@/app/core/cambios-sin-guardar';
import { formatearFechaHora } from '@/app/core/formato';
import { NotificarService } from '@/app/core/notificar.service';
import { valorDe } from '@/app/core/recurso';
import { CampoBusqueda } from '@/app/compartido/campo-busqueda';
import { EstadoError, EstadoVacio, Esqueleto } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import { PermisosMinisterioService } from '@/app/features/eventos/permisos-ministerio.service';
import { AsistenciaService } from './asistencia.service';

type Marca = boolean | null;
type FiltroLista = 'todos' | 'sin' | 'presentes' | 'ausentes';

const FILTROS: { valor: FiltroLista; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'sin', etiqueta: 'Sin marcar' },
  { valor: 'presentes', etiqueta: 'Presentes' },
  { valor: 'ausentes', etiqueta: 'Ausentes' },
];

/** Minúsculas y sin acentos para buscar en la lista cargada */
const normalizar = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** /eventos/:id/asistencia — pase de lista (F3-07). */
@Component({
  selector: 'app-pase-lista',
  imports: [
    RouterLink,
    MatButton,
    MatButtonToggleGroup,
    MatButtonToggle,
    LucideAngularModule,
    PageHeader,
    CampoBusqueda,
    EstadoError,
    EstadoVacio,
    Esqueleto,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pase-lista.page.html',
  styleUrl: './pase-lista.page.css',
})
export class PaseListaPage implements ConCambiosSinGuardar {
  /** Parámetro :id de la ruta (id del evento) */
  readonly id = input.required<string>();
  private readonly servicio = inject(AsistenciaService);
  private readonly permisos = inject(PermisosMinisterioService);
  private readonly notificar = inject(NotificarService);

  protected readonly consulta = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.servicio.obtenerLista(params),
  });
  protected readonly lista = computed(() => valorDe(this.consulta));
  protected readonly evento = computed(() => this.lista()?.evento);

  /** Lo guardado en el servidor; al reabrir o tras guardar se parte de aquí */
  private readonly inicial = computed(
    () =>
      new Map<string, Marca>(
        (this.lista()?.registros ?? []).map((r) => [r.miembro.id, r.presente]),
      ),
  );
  protected readonly marcas = signal(new Map<string, Marca>());
  protected readonly busqueda = signal('');
  protected readonly filtro = signal<FiltroLista>('todos');
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly guardando = signal(false);

  protected readonly puedeRegistrar = computed(() =>
    this.permisos.puede(
      'asistencia:crear',
      'asistencia:crear-propio',
      this.evento()?.ministerio?.id,
    ),
  );
  protected readonly cambios = computed(() => {
    const inicial = this.inicial();
    return (this.lista()?.registros ?? []).some(
      (r) => this.marcas().get(r.miembro.id) !== inicial.get(r.miembro.id),
    );
  });
  protected readonly conteo = computed(() => {
    const valores = [...this.marcas().values()];
    return {
      presentes: valores.filter((v) => v === true).length,
      ausentes: valores.filter((v) => v === false).length,
      sin: valores.filter((v) => v === null).length,
      total: valores.length,
    };
  });
  protected readonly visibles = computed(() => {
    const texto = normalizar(this.busqueda());
    const filtro = this.filtro();
    return (this.lista()?.registros ?? []).filter((r) => {
      const marca = this.marcas().get(r.miembro.id) ?? null;
      if (filtro === 'sin' && marca !== null) return false;
      if (filtro === 'presentes' && marca !== true) return false;
      if (filtro === 'ausentes' && marca !== false) return false;
      return !texto || normalizar(`${r.miembro.nombre} ${r.miembro.apellidos}`).includes(texto);
    });
  });

  protected readonly filtros = FILTROS;
  protected readonly iconos = { ArrowLeft, Ban, Check, CheckCheck, Save, X };
  protected readonly fechaHora = formatearFechaHora;
  protected readonly descripcion = computed(() => {
    const e = this.evento();
    return e
      ? `${formatearFechaHora(e.fechaInicio)}${e.ministerio ? ` · ${e.ministerio.nombre}` : ''}`
      : undefined;
  });

  constructor() {
    // Al cargar (o recargar tras guardar) las marcas parten de lo guardado en el servidor
    effect(() => this.marcas.set(new Map(this.inicial())));
  }

  tieneCambiosSinGuardar() {
    return this.cambios() && !this.guardando();
  }

  // Cerrar o recargar la pestaña con cambios también avisa
  @HostListener('window:beforeunload', ['$event'])
  protected alSalir(evento: BeforeUnloadEvent) {
    if (this.tieneCambiosSinGuardar()) evento.preventDefault();
  }

  protected marcaDe(miembroId: string): Marca {
    return this.marcas().get(miembroId) ?? null;
  }

  protected marcar(miembroId: string, valor: boolean) {
    this.marcas.update((actual) =>
      new Map(actual).set(miembroId, actual.get(miembroId) === valor ? null : valor),
    );
  }

  protected marcarTodos(valor: boolean, soloSinMarcar: boolean) {
    this.marcas.update((actual) => {
      const nuevas = new Map(actual);
      for (const [id, marca] of actual) if (!soloSinMarcar || marca === null) nuevas.set(id, valor);
      return nuevas;
    });
  }

  protected guardar() {
    this.errorServidor.set(null);
    const registros = [...this.marcas()]
      .filter((par): par is [string, boolean] => par[1] !== null)
      .map(([miembroId, presente]) => ({ miembroId, presente }));
    if (registros.length === 0) {
      this.errorServidor.set('Marca al menos a un miembro antes de guardar.');
      return;
    }
    this.guardando.set(true);
    this.servicio.registrar(this.id(), { registros }).subscribe({
      next: () => {
        this.notificar.exito('Asistencia guardada');
        this.guardando.set(false);
        this.consulta.reload();
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.errorServidor.set(normalizarError(e).message);
      },
    });
  }
}
