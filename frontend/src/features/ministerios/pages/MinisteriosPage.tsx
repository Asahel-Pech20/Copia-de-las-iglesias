import { Network, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { BadgeEstado } from '@/components/comunes/BadgeEstado';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { EmptyState, ErrorState } from '@/components/comunes/Estados';
import { CampoBusqueda, FiltrosBar } from '@/components/comunes/Filtros';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Paginacion } from '@/components/comunes/Paginacion';
import { Puede } from '@/components/comunes/Puede';
import { Button } from '@/components/ui/button';
import { Card, CardContent, Skeleton } from '@/components/ui/card';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { MinisterioFormDialog } from '../components/MinisterioFormDialog';
import { useMinisterios } from '../hooks';

const OPCIONES_ESTADO = [
  { valor: 'activos', etiqueta: 'Activos' },
  { valor: 'inactivos', etiqueta: 'Inactivos' },
  { valor: 'todos', etiqueta: 'Todos' },
];

/** /ministerios — tarjetas con búsqueda y filtro de estado (F2-07). */
export function MinisteriosPage() {
  const [filtros, setFiltros] = useFiltrosURL({ q: '', estado: 'activos', page: 1 });
  const consulta = useMinisterios({
    q: filtros.q || undefined,
    activo: filtros.estado === 'todos' ? undefined : filtros.estado === 'activos',
    page: filtros.page,
    limit: 24,
  });
  const [nuevoAbierto, setNuevoAbierto] = useState(false);

  const nuevo = (
    <Button onClick={() => setNuevoAbierto(true)}>
      <Plus aria-hidden /> Nuevo ministerio
    </Button>
  );

  return (
    <>
      <PageHeader
        titulo="Ministerios"
        descripcion="Grupos de servicio de la iglesia, sus coordinadores e integrantes."
        acciones={<Puede permiso="ministerios:crear">{nuevo}</Puede>}
      />

      <FiltrosBar>
        <CampoBusqueda
          valor={filtros.q}
          alCambiar={(q) => setFiltros({ q })}
          placeholder="Buscar ministerio"
        />
        <SelectEnum
          opciones={OPCIONES_ESTADO}
          valor={filtros.estado}
          alCambiar={(estado) => setFiltros({ estado })}
          className="sm:w-36"
          aria-label="Filtrar por estado"
        />
      </FiltrosBar>

      {consulta.isPending ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          role="status"
          aria-label="Cargando"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : consulta.isError ? (
        <Card>
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        </Card>
      ) : consulta.data.data.length === 0 ? (
        <Card>
          <EmptyState
            icono={Network}
            titulo={filtros.q ? 'No hay ministerios con estos filtros' : 'No hay ministerios'}
            descripcion="Prueba con otra búsqueda o registra un ministerio nuevo."
            accion={<Puede permiso="ministerios:crear">{nuevo}</Puede>}
          />
        </Card>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Ministerios">
            {consulta.data.data.map((m) => (
              <li key={m.id}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/ministerios/${m.id}`}
                        className="text-base font-semibold text-primario hover:underline"
                      >
                        {m.nombre}
                      </Link>
                      <BadgeEstado activo={m.activo} />
                    </div>
                    <p className="line-clamp-2 flex-1 text-texto-suave">
                      {m.descripcion ?? 'Sin descripción.'}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm">
                      <Users className="size-4 text-texto-suave" aria-hidden />
                      {m.totalIntegrantes} {m.totalIntegrantes === 1 ? 'integrante' : 'integrantes'}
                    </p>
                    <p className="text-xs text-texto-suave">
                      Coordinación:{' '}
                      {m.coordinadores.length > 0
                        ? m.coordinadores.map((c) => c.nombre).join(', ')
                        : 'sin asignar'}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          <Card className="mt-4">
            <Paginacion
              meta={consulta.data.meta}
              alCambiarPagina={(page) => setFiltros({ page })}
            />
          </Card>
        </>
      )}

      <MinisterioFormDialog abierto={nuevoAbierto} alCambiarAbierto={setNuevoAbierto} />
    </>
  );
}
