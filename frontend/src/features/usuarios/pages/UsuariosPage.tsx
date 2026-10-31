import { MoreHorizontal, Pencil, Plus, Send, UserCheck, UserX, Users } from 'lucide-react';
import { useState } from 'react';
import { BadgeEstado } from '@/components/comunes/BadgeEstado';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { type Columna, DataTable } from '@/components/comunes/DataTable';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { CampoBusqueda, FiltrosBar } from '@/components/comunes/Filtros';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Paginacion } from '@/components/comunes/Paginacion';
import { Puede } from '@/components/comunes/Puede';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSesion } from '@/features/auth/contexto';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { ETIQUETAS_ROL, formatearFechaHora, opcionesDe } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { Rol } from '@/types/comunes';
import type { Usuario } from '@/types/usuarios';
import { UsuarioFormDialog } from '../components/UsuarioFormDialog';
import { useCambiarEstadoUsuario, useReenviarInvitacion, useUsuarios } from '../hooks';

const OPCIONES_ROL = [
  { valor: 'todos', etiqueta: 'Todos los roles' },
  ...opcionesDe(ETIQUETAS_ROL),
];
const OPCIONES_ESTADO = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'activos', etiqueta: 'Activos' },
  { valor: 'inactivos', etiqueta: 'Inactivos' },
];

const COLUMNAS: Columna<Usuario>[] = [
  {
    clave: 'nombre',
    encabezado: 'Nombre',
    celda: (u) => <span className="font-medium">{u.nombre}</span>,
  },
  { clave: 'email', encabezado: 'Correo', celda: (u) => u.email },
  { clave: 'rol', encabezado: 'Rol', celda: (u) => ETIQUETAS_ROL[u.rol] },
  { clave: 'activo', encabezado: 'Estado', celda: (u) => <BadgeEstado activo={u.activo} /> },
  {
    clave: 'ultimoAcceso',
    encabezado: 'Último acceso',
    celda: (u) => formatearFechaHora(u.ultimoAcceso),
    ocultarEnTarjeta: true,
  },
];

export function UsuariosPage() {
  const { usuario: yo } = useSesion();
  const [filtros, setFiltros] = useFiltrosURL({ q: '', rol: 'todos', estado: 'todos', page: 1 });
  const consulta = useUsuarios({
    q: filtros.q || undefined,
    rol: filtros.rol === 'todos' ? undefined : (filtros.rol as Rol),
    activo: filtros.estado === 'todos' ? undefined : filtros.estado === 'activos',
    page: filtros.page,
  });
  const cambiarEstado = useCambiarEstadoUsuario();
  const reenviar = useReenviarInvitacion();

  const [formulario, setFormulario] = useState<{ abierto: boolean; usuario?: Usuario }>({
    abierto: false,
  });
  const [porDesactivar, setPorDesactivar] = useState<Usuario | null>(null);

  async function activar(usuario: Usuario) {
    try {
      await cambiarEstado.mutateAsync({ id: usuario.id, activo: true });
      notificar.exito('Usuario activado');
    } catch (error) {
      notificar.error(error);
    }
  }

  async function reenviarInvitacion(usuario: Usuario) {
    try {
      await reenviar.mutateAsync(usuario.id);
      notificar.exito(`Invitación reenviada a ${usuario.email}`);
    } catch (error) {
      notificar.error(error);
    }
  }

  const nuevo = (
    <Button onClick={() => setFormulario({ abierto: true })}>
      <Plus aria-hidden /> Nuevo usuario
    </Button>
  );

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion="Personal con acceso al sistema."
        acciones={<Puede permiso="usuarios:crear">{nuevo}</Puede>}
      />

      <FiltrosBar>
        <CampoBusqueda
          valor={filtros.q}
          alCambiar={(q) => setFiltros({ q })}
          placeholder="Buscar por nombre o correo"
        />
        <SelectEnum
          opciones={OPCIONES_ROL}
          valor={filtros.rol}
          alCambiar={(rol) => setFiltros({ rol })}
          className="sm:w-48"
          aria-label="Filtrar por rol"
        />
        <SelectEnum
          opciones={OPCIONES_ESTADO}
          valor={filtros.estado}
          alCambiar={(estado) => setFiltros({ estado })}
          className="sm:w-40"
          aria-label="Filtrar por estado"
        />
      </FiltrosBar>

      <Card>
        {consulta.isPending ? (
          <SkeletonTabla columnas={5} />
        ) : consulta.isError ? (
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        ) : consulta.data.data.length === 0 ? (
          <EmptyState
            icono={Users}
            titulo="No hay usuarios con estos filtros"
            descripcion="Prueba con otra búsqueda o crea un usuario nuevo."
          />
        ) : (
          <>
            <DataTable
              etiqueta="Usuarios"
              columnas={COLUMNAS}
              datos={consulta.data.data}
              obtenerId={(u) => u.id}
              acciones={(u) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variante="fantasma"
                      tamano="icono"
                      aria-label={`Acciones de ${u.nombre}`}
                    >
                      <MoreHorizontal aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setFormulario({ abierto: true, usuario: u })}>
                      <Pencil aria-hidden /> Editar
                    </DropdownMenuItem>
                    {!u.ultimoAcceso && u.activo && (
                      <DropdownMenuItem onSelect={() => reenviarInvitacion(u)}>
                        <Send aria-hidden /> Reenviar invitación
                      </DropdownMenuItem>
                    )}
                    {u.activo ? (
                      u.id !== yo?.id && (
                        <DropdownMenuItem peligro onSelect={() => setPorDesactivar(u)}>
                          <UserX aria-hidden /> Desactivar
                        </DropdownMenuItem>
                      )
                    ) : (
                      <DropdownMenuItem onSelect={() => activar(u)}>
                        <UserCheck aria-hidden /> Activar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
            <Paginacion
              meta={consulta.data.meta}
              alCambiarPagina={(page) => setFiltros({ page })}
            />
          </>
        )}
      </Card>

      <UsuarioFormDialog
        abierto={formulario.abierto}
        usuario={formulario.usuario}
        alCambiarAbierto={(abierto) => setFormulario((f) => ({ ...f, abierto }))}
      />

      <ConfirmDialog
        abierto={porDesactivar !== null}
        alCambiarAbierto={(abierto) => !abierto && setPorDesactivar(null)}
        titulo="Desactivar usuario"
        descripcion={`${porDesactivar?.nombre} ya no podrá iniciar sesión y se cerrarán sus sesiones abiertas.`}
        textoConfirmar="Desactivar"
        peligro
        alConfirmar={async () => {
          await cambiarEstado.mutateAsync({ id: porDesactivar!.id, activo: false });
          notificar.exito('Usuario desactivado');
        }}
      />
    </>
  );
}
