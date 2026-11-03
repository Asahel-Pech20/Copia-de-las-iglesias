import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import {
  LucideAngularModule,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  UserCheck,
  Users,
  UserX,
} from 'lucide-angular';
import { filtrosURL } from '@/app/core/filtros-url';
import { valorDe } from '@/app/core/recurso';
import { ETIQUETAS_ROL, formatearFechaHora, opcionesDe } from '@/app/core/formato';
import { NotificarService } from '@/app/core/notificar.service';
import { PuedeDirective } from '@/app/core/puede.directive';
import { SesionService } from '@/app/core/sesion.service';
import { BadgeEstado } from '@/app/compartido/badge-estado';
import { CampoBusqueda } from '@/app/compartido/campo-busqueda';
import { ConfirmarService } from '@/app/compartido/confirmar-dialogo';
import { EstadoError, EstadoVacio, Esqueleto } from '@/app/compartido/estados';
import { PageHeader } from '@/app/compartido/page-header';
import { Paginacion } from '@/app/compartido/paginacion';
import type { Rol } from '@/app/tipos/comunes';
import type { Usuario } from '@/app/tipos/usuarios';
import { UsuarioFormDialogo } from './usuario-form.dialogo';
import { UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  imports: [
    MatTableModule,
    MatButton,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    LucideAngularModule,
    PuedeDirective,
    PageHeader,
    CampoBusqueda,
    BadgeEstado,
    EstadoVacio,
    EstadoError,
    Esqueleto,
    Paginacion,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './usuarios.page.html',
})
export class UsuariosPage {
  private readonly servicio = inject(UsuariosService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmar = inject(ConfirmarService);
  private readonly notificar = inject(NotificarService);
  protected readonly yo = inject(SesionService).usuario;

  protected readonly filtros = filtrosURL({ q: '', rol: 'todos', estado: 'todos', page: 1 });
  protected readonly consulta = rxResource({
    params: () => {
      const f = this.filtros.valores();
      return {
        q: f.q || undefined,
        rol: f.rol === 'todos' ? undefined : (f.rol as Rol),
        activo: f.estado === 'todos' ? undefined : f.estado === 'activos',
        page: f.page,
      };
    },
    stream: ({ params }) => this.servicio.listar(params),
  });
  protected readonly filas = computed(() => valorDe(this.consulta)?.data ?? []);

  protected readonly columnas = ['nombre', 'email', 'rol', 'activo', 'ultimoAcceso', 'acciones'];
  protected readonly opcionesRol = [
    { valor: 'todos', etiqueta: 'Todos los roles' },
    ...opcionesDe(ETIQUETAS_ROL),
  ];
  protected readonly opcionesEstado = [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'activos', etiqueta: 'Activos' },
    { valor: 'inactivos', etiqueta: 'Inactivos' },
  ];
  protected etiquetaRol(u: Usuario) {
    return ETIQUETAS_ROL[u.rol];
  }
  protected readonly fechaHora = formatearFechaHora;
  protected readonly iconos = { Plus, MoreHorizontal, Pencil, Send, UserX, UserCheck, Users };

  protected abrirFormulario(usuario?: Usuario) {
    this.dialog
      .open(UsuarioFormDialogo, {
        data: usuario ?? null,
        width: '32rem',
        maxWidth: 'calc(100vw - 32px)',
      })
      .afterClosed()
      .subscribe((guardado) => guardado && this.consulta.reload());
  }

  protected activar(usuario: Usuario) {
    this.servicio.cambiarEstado(usuario.id, true).subscribe({
      next: () => {
        this.notificar.exito('Usuario activado');
        this.consulta.reload();
      },
      error: (e: unknown) => this.notificar.error(e),
    });
  }

  protected async desactivar(usuario: Usuario) {
    const hecho = await this.confirmar.abrir({
      titulo: 'Desactivar usuario',
      descripcion: `${usuario.nombre} ya no podrá iniciar sesión y se cerrarán sus sesiones abiertas.`,
      textoConfirmar: 'Desactivar',
      peligro: true,
      alConfirmar: () => this.servicio.cambiarEstado(usuario.id, false),
    });
    if (hecho) {
      this.notificar.exito('Usuario desactivado');
      this.consulta.reload();
    }
  }

  protected reenviar(usuario: Usuario) {
    this.servicio.reenviarInvitacion(usuario.id).subscribe({
      next: () => this.notificar.exito(`Invitación reenviada a ${usuario.email}`),
      error: (e: unknown) => this.notificar.error(e),
    });
  }
}
