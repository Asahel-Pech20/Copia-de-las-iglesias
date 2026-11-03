import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Paginacion } from '@/components/comunes/Paginacion';
import { Puede } from '@/components/comunes/Puede';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFiltrosURL } from '@/hooks/useFiltrosURL';
import { usePermiso } from '@/hooks/usePermiso';
import { notificar } from '@/lib/notificar';
import type { Anuncio } from '@/types/anuncios';
import { AnuncioFormDialog } from '../components/AnuncioFormDialog';
import { TarjetaAnuncio } from '../components/TarjetaAnuncio';
import { useAnuncios, useEliminarAnuncio } from '../hooks';

type Pestana = 'vigentes' | 'programados' | 'expirados';

const VACIOS: Record<Pestana, string> = {
  vigentes: 'No hay anuncios vigentes',
  programados: 'No hay anuncios programados',
  expirados: 'No hay anuncios expirados',
};

/** /anuncios: pestañas Vigentes / Programados / Expirados; IMPORTANTE primero (F3-10, F3-11). */
export function AnunciosPage() {
  const [filtros, setFiltros] = useFiltrosURL({ tab: 'vigentes', page: 1 });
  const pestana = filtros.tab as Pestana;
  const puedeCrear = usePermiso('anuncios:crear');
  const [formulario, setFormulario] = useState<{ abierto: boolean; anuncio?: Anuncio }>({
    abierto: false,
  });
  const [porEliminar, setPorEliminar] = useState<Anuncio | null>(null);
  const eliminar = useEliminarAnuncio();

  // Vigentes paginados; programados y expirados salen de vigentes=false y se separan por fecha
  const vigentes = useAnuncios({ vigentes: true, page: filtros.page });
  const noVigentes = useAnuncios({ vigentes: false, limit: 100 });
  const consulta = pestana === 'vigentes' ? vigentes : noVigentes;
  // Momento de la consulta: separa programados (publicación futura) de expirados
  const ahora = noVigentes.dataUpdatedAt;
  const lista =
    pestana === 'vigentes'
      ? (vigentes.data?.data ?? [])
      : (noVigentes.data?.data ?? []).filter((a) =>
          pestana === 'programados'
            ? Date.parse(a.fechaPublicacion) > ahora
            : Date.parse(a.fechaPublicacion) <= ahora,
        );

  return (
    <>
      <PageHeader
        titulo="Anuncios"
        descripcion="Comunicados para la congregación."
        acciones={
          puedeCrear && (
            <Button onClick={() => setFormulario({ abierto: true })}>
              <Plus aria-hidden /> Nuevo anuncio
            </Button>
          )
        }
      />
      <Tabs value={pestana} onValueChange={(tab) => setFiltros({ tab })}>
        <TabsList className="h-auto">
          <TabsTrigger value="vigentes" className="min-h-10">
            Vigentes
          </TabsTrigger>
          <TabsTrigger value="programados" className="min-h-10">
            Programados
          </TabsTrigger>
          <TabsTrigger value="expirados" className="min-h-10">
            Expirados
          </TabsTrigger>
        </TabsList>
        <TabsContent value={pestana}>
          {consulta.isPending ? (
            <Card>
              <SkeletonTabla filas={3} columnas={1} />
            </Card>
          ) : consulta.isError ? (
            <Card>
              <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
            </Card>
          ) : lista.length === 0 ? (
            <Card>
              <EmptyState
                icono={Megaphone}
                titulo={VACIOS[pestana]}
                accion={
                  puedeCrear && (
                    <Button onClick={() => setFormulario({ abierto: true })}>
                      Publicar anuncio
                    </Button>
                  )
                }
              />
            </Card>
          ) : (
            <>
              <ul aria-label={`Anuncios ${pestana}`} className="grid gap-3 md:grid-cols-2">
                {lista.map((a) => (
                  <li key={a.id}>
                    <TarjetaAnuncio
                      anuncio={a}
                      className="h-full"
                      acciones={
                        <>
                          <Puede permiso="anuncios:editar">
                            <Button
                              variante="contorno"
                              tamano="sm"
                              onClick={() => setFormulario({ abierto: true, anuncio: a })}
                              aria-label={`Editar ${a.titulo}`}
                            >
                              <Pencil aria-hidden /> Editar
                            </Button>
                          </Puede>
                          <Puede permiso="anuncios:eliminar">
                            <Button
                              variante="contorno"
                              tamano="sm"
                              onClick={() => setPorEliminar(a)}
                              aria-label={`Eliminar ${a.titulo}`}
                            >
                              <Trash2 aria-hidden /> Eliminar
                            </Button>
                          </Puede>
                        </>
                      }
                    />
                  </li>
                ))}
              </ul>
              {pestana === 'vigentes' && vigentes.data && (
                <Paginacion
                  meta={vigentes.data.meta}
                  alCambiarPagina={(page) => setFiltros({ page })}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <AnuncioFormDialog
        anuncio={formulario.anuncio}
        abierto={formulario.abierto}
        alCambiarAbierto={(abierto) => setFormulario((f) => ({ ...f, abierto }))}
      />
      <ConfirmDialog
        abierto={porEliminar !== null}
        alCambiarAbierto={(abierto) => !abierto && setPorEliminar(null)}
        titulo="Eliminar anuncio"
        descripcion={`Se eliminará definitivamente "${porEliminar?.titulo ?? ''}".`}
        textoConfirmar="Eliminar"
        peligro
        alConfirmar={async () => {
          await eliminar.mutateAsync(porEliminar!.id);
          notificar.exito('Anuncio eliminado');
        }}
      />
    </>
  );
}
