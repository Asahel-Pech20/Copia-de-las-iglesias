import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { LucideAngularModule, Megaphone, Pencil, Plus, Trash2 } from 'lucide-angular';
import { ConfirmarService } from '@/app/compartido/confirmar-dialogo';
import { EstadoError, EstadoVacio, Esqueleto } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import { Paginacion } from '@/app/compartido/paginacion';
import { filtrosURL } from '@/app/core/filtros-url';
import { NotificarService } from '@/app/core/notificar.service';
import { PuedeDirective } from '@/app/core/puede.directive';
import { valorDe } from '@/app/core/recurso';
import { SesionService } from '@/app/core/sesion.service';
import type { Anuncio } from '@/app/tipos/anuncios';
import { AnuncioFormDialogo } from './anuncio-form.dialogo';
import { AnunciosService } from './anuncios.service';
import { TarjetaAnuncio } from './tarjeta-anuncio';

type Pestana = 'vigentes' | 'programados' | 'expirados';
const PESTANAS: Pestana[] = ['vigentes', 'programados', 'expirados'];

const VACIOS: Record<Pestana, string> = {
  vigentes: 'No hay anuncios vigentes',
  programados: 'No hay anuncios programados',
  expirados: 'No hay anuncios expirados',
};

/** /anuncios — pestañas Vigentes / Programados / Expirados; IMPORTANTE primero (F3-10, F3-11). */
@Component({
  selector: 'app-anuncios',
  imports: [
    MatButton,
    MatTabGroup,
    MatTab,
    LucideAngularModule,
    PuedeDirective,
    PageHeader,
    EstadoVacio,
    EstadoError,
    Esqueleto,
    Paginacion,
    TarjetaAnuncio,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './anuncios.page.html',
  styles: `
    .lista {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    @media (min-width: 768px) {
      .lista {
        grid-template-columns: 1fr 1fr;
      }
    }
    .pestana {
      padding-top: 16px;
    }
    .paginacion {
      margin-top: 12px;
    }
  `,
})
export class AnunciosPage {
  private readonly servicio = inject(AnunciosService);
  private readonly sesion = inject(SesionService);
  private readonly dialogo = inject(MatDialog);
  private readonly confirmar = inject(ConfirmarService);
  private readonly notificar = inject(NotificarService);

  protected readonly filtros = filtrosURL({ tab: 'vigentes', page: 1 });
  protected readonly pestanas = PESTANAS;
  protected readonly vacios = VACIOS;
  protected readonly iconos = { Megaphone, Pencil, Plus, Trash2 };
  protected readonly puedeCrear = computed(() => this.sesion.puede('anuncios:crear'));

  protected readonly pestana = computed<Pestana>(() => {
    const tab = this.filtros.valores().tab as Pestana;
    return PESTANAS.includes(tab) ? tab : 'vigentes';
  });
  protected readonly indice = computed(() => PESTANAS.indexOf(this.pestana()));

  // Vigentes paginados; programados y expirados salen de vigentes=false y se separan por fecha
  protected readonly vigentes = rxResource({
    params: () => ({ vigentes: true, page: this.filtros.valores().page }),
    stream: ({ params }) => this.servicio.listar(params),
  });
  protected readonly noVigentes = rxResource({
    stream: () => this.servicio.listar({ vigentes: false, limit: 100 }),
  });
  protected readonly consulta = computed(() =>
    this.pestana() === 'vigentes' ? this.vigentes : this.noVigentes,
  );
  /** Momento de la consulta: separa programados (publicación futura) de expirados */
  private readonly ahora = Date.now();
  protected readonly lista = computed<Anuncio[]>(() => {
    const pestana = this.pestana();
    if (pestana === 'vigentes') return valorDe(this.vigentes)?.data ?? [];
    return (valorDe(this.noVigentes)?.data ?? []).filter((a) =>
      pestana === 'programados'
        ? Date.parse(a.fechaPublicacion) > this.ahora
        : Date.parse(a.fechaPublicacion) <= this.ahora,
    );
  });

  protected cambiarPestana(indice: number) {
    const tab = PESTANAS[indice] ?? 'vigentes';
    if (tab !== this.pestana()) this.filtros.cambiar({ tab });
  }

  protected abrirFormulario(anuncio?: Anuncio) {
    this.dialogo
      .open<AnuncioFormDialogo, Anuncio | undefined, boolean>(AnuncioFormDialogo, {
        data: anuncio,
        width: '42rem',
        maxWidth: 'calc(100vw - 32px)',
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) this.recargar();
      });
  }

  protected async eliminar(anuncio: Anuncio) {
    const ok = await this.confirmar.abrir({
      titulo: 'Eliminar anuncio',
      descripcion: `Se eliminará definitivamente "${anuncio.titulo}".`,
      textoConfirmar: 'Eliminar',
      peligro: true,
      alConfirmar: () => this.servicio.eliminar(anuncio.id),
    });
    if (ok) {
      this.notificar.exito('Anuncio eliminado');
      this.recargar();
    }
  }

  private recargar() {
    this.vigentes.reload();
    this.noVigentes.reload();
  }
}
