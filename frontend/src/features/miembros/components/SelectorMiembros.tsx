import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { type ComponentProps, type KeyboardEvent, useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useMiembro, useMiembros } from '../hooks';

interface MiembroOpcion {
  id: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
}

type PropsControl = Pick<
  ComponentProps<'button'>,
  'id' | 'aria-invalid' | 'aria-describedby' | 'aria-required' | 'disabled'
>;

interface PropsComunes extends PropsControl {
  /** Solo integrantes activos de este ministerio */
  ministerioId?: string;
  /** Incluye miembros inactivos en la búsqueda (por defecto solo activos) */
  incluirInactivos?: boolean;
  /** Ids que no se ofrecen (p. ej. los integrantes actuales) */
  excluirIds?: string[];
  placeholder?: string;
  className?: string;
}

interface PropsSimple extends PropsComunes {
  modo?: 'simple';
  valor: string | null;
  alCambiar: (id: string | null) => void;
}

interface PropsMultiple extends PropsComunes {
  modo: 'multiple';
  valor: string[];
  alCambiar: (ids: string[]) => void;
}

export type SelectorMiembrosProps = PropsSimple | PropsMultiple;

const nombreCompleto = (m: Pick<MiembroOpcion, 'nombre' | 'apellidos'>) =>
  `${m.nombre} ${m.apellidos}`;

/** Nombre de un miembro ya seleccionado (usa la caché de TanStack Query). */
function NombreMiembro({ id, conocidos }: { id: string; conocidos: Map<string, MiembroOpcion> }) {
  const conocido = conocidos.get(id);
  const { data } = useMiembro(conocido ? undefined : id);
  const miembro = conocido ?? data;
  return <>{miembro ? nombreCompleto(miembro) : 'Cargando…'}</>;
}

/**
 * Combobox para elegir miembros con búsqueda asíncrona (debounce 300 ms, sin acentos).
 * Accesible: botón con role combobox + listbox navegable con flechas, Enter y Escape.
 *
 * @example Selección simple (responsable, donante):
 * <SelectorMiembros valor={miembroId} alCambiar={setMiembroId} />
 *
 * @example Selección múltiple con chips, excluyendo a los ya vinculados:
 * <SelectorMiembros modo="multiple" valor={ids} alCambiar={setIds} excluirIds={actuales} />
 *
 * @example Dentro de FormField + React Hook Form:
 * <Controller control={control} name="miembroId" render={({ field }) => (
 *   <FormField label="Miembro"><SelectorMiembros valor={field.value} alCambiar={field.onChange} /></FormField>
 * )} />
 */
export function SelectorMiembros(props: SelectorMiembrosProps) {
  const {
    ministerioId,
    incluirInactivos = false,
    excluirIds = [],
    placeholder,
    className,
    id,
    disabled,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    'aria-required': ariaRequired,
  } = props;
  const multiple = props.modo === 'multiple';
  const seleccionados = multiple ? props.valor : props.valor ? [props.valor] : [];

  const idListbox = useId();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [activo, setActivo] = useState(0);
  // Nombres de los miembros vistos, para mostrar los seleccionados sin otra petición
  const [conocidos, setConocidos] = useState(() => new Map<string, MiembroOpcion>());

  useEffect(() => {
    const t = setTimeout(() => setBusqueda(texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto]);

  const consulta = useMiembros(
    {
      q: busqueda || undefined,
      estado: incluirInactivos ? 'todos' : 'activo',
      ministerioId,
      limit: 20,
    },
    { habilitado: abierto },
  );
  const opciones = (consulta.data?.data ?? []).filter((m) => !excluirIds.includes(m.id));

  function recordar(miembro: MiembroOpcion) {
    setConocidos((previo) => new Map(previo).set(miembro.id, miembro));
  }

  function elegir(miembro: MiembroOpcion) {
    recordar(miembro);
    if (props.modo === 'multiple') {
      props.alCambiar(
        props.valor.includes(miembro.id)
          ? props.valor.filter((v) => v !== miembro.id)
          : [...props.valor, miembro.id],
      );
    } else {
      props.alCambiar(miembro.id);
      setAbierto(false);
    }
  }

  function quitar(idMiembro: string) {
    if (props.modo === 'multiple') props.alCambiar(props.valor.filter((v) => v !== idMiembro));
    else props.alCambiar(null);
  }

  function alTeclear(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActivo((i) => Math.min(i + 1, opciones.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opcion = opciones[activo];
      if (opcion) elegir(opcion);
    }
  }

  const textoBoton = multiple
    ? seleccionados.length > 0
      ? `${seleccionados.length} seleccionado${seleccionados.length === 1 ? '' : 's'}`
      : (placeholder ?? 'Agregar miembros…')
    : null;
  const idOpcion = (i: number) => `${idListbox}-opcion-${i}`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Popover
        open={abierto}
        onOpenChange={(valor) => {
          setAbierto(valor);
          if (!valor) setTexto('');
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variante="contorno"
            role="combobox"
            aria-expanded={abierto}
            aria-haspopup="listbox"
            aria-controls={abierto ? idListbox : undefined}
            id={id}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedby}
            aria-required={ariaRequired}
            className="w-full justify-between font-normal"
          >
            <span className={cn('truncate', seleccionados.length === 0 && 'text-texto-suave')}>
              {multiple ? (
                textoBoton
              ) : seleccionados[0] ? (
                <NombreMiembro id={seleccionados[0]} conocidos={conocidos} />
              ) : (
                (placeholder ?? 'Selecciona un miembro…')
              )}
            </span>
            <ChevronsUpDown className="opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-64 p-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-texto-suave"
              aria-hidden
            />
            <Input
              autoFocus
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                setActivo(0);
              }}
              onKeyDown={alTeclear}
              placeholder="Buscar por nombre…"
              aria-label="Buscar miembro"
              aria-controls={idListbox}
              aria-activedescendant={opciones[activo] ? idOpcion(activo) : undefined}
              aria-autocomplete="list"
              className="pl-9"
            />
          </div>
          <ul
            id={idListbox}
            role="listbox"
            aria-label="Miembros"
            aria-multiselectable={multiple || undefined}
            className="mt-2 max-h-64 overflow-y-auto"
          >
            {consulta.isPending || (consulta.isFetching && opciones.length === 0) ? (
              <li className="flex items-center gap-2 p-2 text-texto-suave" role="presentation">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Buscando…
              </li>
            ) : consulta.isError ? (
              <li className="p-2 text-peligro" role="presentation">
                No se pudieron cargar los miembros.
              </li>
            ) : opciones.length === 0 ? (
              <li className="p-2 text-texto-suave" role="presentation">
                Sin resultados.
              </li>
            ) : (
              opciones.map((m, i) => {
                const marcado = seleccionados.includes(m.id);
                return (
                  <li
                    key={m.id}
                    id={idOpcion(i)}
                    role="option"
                    aria-selected={marcado}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => elegir(m)}
                    onMouseEnter={() => setActivo(i)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                      i === activo && 'bg-superficie-suave',
                    )}
                  >
                    <Check
                      className={cn('size-4 text-primario', !marcado && 'invisible')}
                      aria-hidden
                    />
                    <span className="flex-1 truncate">{nombreCompleto(m)}</span>
                    {!m.activo && <Badge variante="neutro">Inactivo</Badge>}
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>

      {multiple && seleccionados.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Miembros seleccionados">
          {seleccionados.map((idMiembro) => (
            <li
              key={idMiembro}
              className="inline-flex items-center gap-1 rounded-full border bg-superficie-suave py-0.5 pl-2.5 pr-1 text-xs"
            >
              <NombreMiembro id={idMiembro} conocidos={conocidos} />
              <button
                type="button"
                onClick={() => quitar(idMiembro)}
                className="rounded-full p-0.5 hover:bg-borde"
                aria-label="Quitar"
                title="Quitar"
                disabled={disabled}
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
