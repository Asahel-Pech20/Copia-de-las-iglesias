import { ArrowLeft, Ban, Check, CheckCheck, Loader2, Save, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useBlocker, useParams } from 'react-router';
import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { CampoBusqueda } from '@/components/comunes/Filtros';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Button } from '@/components/ui/button';
import { Alert, Card } from '@/components/ui/card';
import { usePuedeGestionar } from '@/features/eventos/permisos';
import { normalizarError } from '@/lib/api';
import { formatearFechaHora } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import { cn } from '@/lib/utils';
import type { ListaAsistencia } from '@/types/asistencia';
import { useListaAsistencia, useRegistrarAsistencia } from '../hooks';

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

/** /eventos/:id/asistencia (F3-07). */
export function PaseListaPage() {
  const { id = '' } = useParams();
  const consulta = useListaAsistencia(id);

  if (consulta.isPending) {
    return (
      <>
        <PageHeader titulo="Pase de lista" />
        <Card>
          <SkeletonTabla filas={6} columnas={2} />
        </Card>
      </>
    );
  }
  if (consulta.isError) {
    return (
      <>
        <PageHeader titulo="Pase de lista" />
        <Card>
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        </Card>
      </>
    );
  }
  // key: al reabrir o tras guardar se parte de lo guardado en el servidor
  return <PaseLista key={consulta.dataUpdatedAt} lista={consulta.data} />;
}

function PaseLista({ lista }: { lista: ListaAsistencia }) {
  const { evento } = lista;
  const registrar = useRegistrarAsistencia(evento.id);
  const puedeRegistrar = usePuedeGestionar(
    'asistencia:crear',
    'asistencia:crear-propio',
  )(evento.ministerio?.id);
  const inicial = useMemo(
    () => new Map<string, Marca>(lista.registros.map((r) => [r.miembro.id, r.presente])),
    [lista],
  );
  const [marcas, setMarcas] = useState(inicial);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroLista>('todos');
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const guardando = useRef(false);

  const cambios = lista.registros.some(
    (r) => marcas.get(r.miembro.id) !== inicial.get(r.miembro.id),
  );
  const valores = [...marcas.values()];
  const conteo = {
    presentes: valores.filter((v) => v === true).length,
    ausentes: valores.filter((v) => v === false).length,
    sin: valores.filter((v) => v === null).length,
  };

  // Aviso al salir sin guardar (dentro de la app y al cerrar la pestaña)
  const bloqueo = useBlocker(
    ({ currentLocation, nextLocation }) =>
      cambios && !guardando.current && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (!cambios) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [cambios]);

  if (evento.estado === 'CANCELADO') {
    return (
      <>
        <Encabezado lista={lista} />
        <Card>
          <EmptyState
            icono={Ban}
            titulo="Este evento está cancelado"
            descripcion="No se puede registrar asistencia en un evento cancelado."
            accion={
              <Button variante="contorno" asChild>
                <Link to={`/eventos/${evento.id}`}>Ver evento</Link>
              </Button>
            }
          />
        </Card>
      </>
    );
  }

  const texto = normalizar(busqueda);
  const visibles = lista.registros.filter((r) => {
    const marca = marcas.get(r.miembro.id) ?? null;
    if (filtro === 'sin' && marca !== null) return false;
    if (filtro === 'presentes' && marca !== true) return false;
    if (filtro === 'ausentes' && marca !== false) return false;
    return !texto || normalizar(`${r.miembro.nombre} ${r.miembro.apellidos}`).includes(texto);
  });

  function marcar(miembroId: string, valor: boolean) {
    setMarcas((actual) =>
      new Map(actual).set(miembroId, actual.get(miembroId) === valor ? null : valor),
    );
  }

  function marcarTodos(valor: boolean, soloSinMarcar: boolean) {
    setMarcas((actual) => {
      const nuevas = new Map(actual);
      for (const [id, marca] of actual) if (!soloSinMarcar || marca === null) nuevas.set(id, valor);
      return nuevas;
    });
  }

  async function guardar() {
    setErrorServidor(null);
    const registros = [...marcas]
      .filter((par): par is [string, boolean] => par[1] !== null)
      .map(([miembroId, presente]) => ({ miembroId, presente }));
    if (registros.length === 0) {
      setErrorServidor('Marca al menos a un miembro antes de guardar.');
      return;
    }
    guardando.current = true;
    try {
      await registrar.mutateAsync({ registros });
      notificar.exito('Asistencia guardada');
    } catch (error) {
      setErrorServidor(normalizarError(error).message);
    } finally {
      guardando.current = false;
    }
  }

  return (
    <div className="pb-24">
      <Encabezado lista={lista} />

      <p aria-live="polite" className="mb-3 text-sm font-medium">
        <span className="text-exito">{conteo.presentes} presentes</span> ·{' '}
        <span className="text-peligro">{conteo.ausentes} ausentes</span> ·{' '}
        <span className="text-texto-suave">{conteo.sin} sin marcar</span> de {marcas.size}
      </p>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <CampoBusqueda
          valor={busqueda}
          alCambiar={setBusqueda}
          placeholder="Buscar miembro…"
          demoraMs={150}
        />
        <div role="group" aria-label="Filtrar lista" className="flex flex-wrap gap-1">
          {FILTROS.map((f) => (
            <Button
              key={f.valor}
              tamano="sm"
              variante={filtro === f.valor ? 'primario' : 'contorno'}
              aria-pressed={filtro === f.valor}
              className="min-h-11"
              onClick={() => setFiltro(f.valor)}
            >
              {f.etiqueta}
            </Button>
          ))}
        </div>
      </div>

      {puedeRegistrar && (
        <div className="mb-3 flex flex-wrap gap-2">
          <Button variante="contorno" className="min-h-11" onClick={() => marcarTodos(true, false)}>
            <CheckCheck aria-hidden /> Marcar todos presentes
          </Button>
          <Button variante="contorno" className="min-h-11" onClick={() => marcarTodos(false, true)}>
            <X aria-hidden /> Marcar restantes como ausentes
          </Button>
        </div>
      )}

      {errorServidor && (
        <Alert variante="peligro" className="mb-3">
          {errorServidor}
        </Alert>
      )}

      <Card>
        {visibles.length === 0 ? (
          <EmptyState titulo="No hay miembros con estos filtros" />
        ) : (
          <ul aria-label="Lista de asistencia" className="flex flex-col divide-y">
            {visibles.map(({ miembro }) => {
              const marca = marcas.get(miembro.id) ?? null;
              const nombre = `${miembro.nombre} ${miembro.apellidos}`;
              return (
                <li key={miembro.id} className="flex items-center gap-2 px-3 py-2 sm:px-4">
                  <span className="min-w-0 flex-1 truncate font-medium">{nombre}</span>
                  <div
                    role="group"
                    aria-label={`Asistencia de ${nombre}`}
                    className="flex shrink-0 gap-1"
                  >
                    <button
                      type="button"
                      aria-pressed={marca === true}
                      aria-label={`Presente: ${nombre}`}
                      disabled={!puedeRegistrar}
                      onClick={() => marcar(miembro.id, true)}
                      className={cn(
                        'inline-flex size-11 items-center justify-center rounded-lg border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anillo disabled:opacity-50 sm:w-auto sm:px-3',
                        marca === true
                          ? 'border-exito bg-exito text-superficie'
                          : 'bg-superficie text-texto',
                      )}
                    >
                      <Check className="size-5" aria-hidden />
                      <span className="hidden sm:ml-1 sm:inline">Presente</span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={marca === false}
                      aria-label={`Ausente: ${nombre}`}
                      disabled={!puedeRegistrar}
                      onClick={() => marcar(miembro.id, false)}
                      className={cn(
                        'inline-flex size-11 items-center justify-center rounded-lg border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anillo disabled:opacity-50 sm:w-auto sm:px-3',
                        marca === false
                          ? 'border-peligro bg-peligro text-peligro-texto'
                          : 'bg-superficie text-texto',
                      )}
                    >
                      <X className="size-5" aria-hidden />
                      <span className="hidden sm:ml-1 sm:inline">Ausente</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Guardado explícito con botón fijo inferior, al alcance del pulgar */}
      {puedeRegistrar && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-superficie/95 p-3 backdrop-blur md:left-60">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <span className="text-sm text-texto-suave">
              {cambios ? 'Tienes cambios sin guardar' : 'Todo guardado'}
            </span>
            <Button
              className="min-h-11 px-6"
              onClick={guardar}
              disabled={!cambios || registrar.isPending}
            >
              {registrar.isPending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Save aria-hidden />
              )}
              Guardar asistencia
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        abierto={bloqueo.state === 'blocked'}
        alCambiarAbierto={(abierto) => {
          if (!abierto && bloqueo.state === 'blocked') bloqueo.reset?.();
        }}
        titulo="¿Salir sin guardar?"
        descripcion="Marcaste asistencia que aún no se ha guardado. Si sales, se perderá."
        textoConfirmar="Salir sin guardar"
        peligro
        alConfirmar={() => bloqueo.proceed?.()}
      />
    </div>
  );
}

function Encabezado({ lista: { evento } }: { lista: ListaAsistencia }) {
  return (
    <PageHeader
      titulo={`Pase de lista: ${evento.titulo}`}
      descripcion={`${formatearFechaHora(evento.fechaInicio)}${evento.ministerio ? ` · ${evento.ministerio.nombre}` : ''}`}
      acciones={
        <Button variante="contorno" asChild>
          <Link to={`/eventos/${evento.id}`}>
            <ArrowLeft aria-hidden /> Evento
          </Link>
        </Button>
      }
    />
  );
}
