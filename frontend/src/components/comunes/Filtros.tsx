import { CalendarRange, Search, X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { aFechaApi, formatearFecha } from '@/lib/formato';
import { cn } from '@/lib/utils';

/** Contenedor de filtros de un listado (búsqueda, selects, rango de fechas). */
export function FiltrosBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="search"
      className={cn('mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center', className)}
    >
      {children}
    </div>
  );
}

interface CampoBusquedaProps {
  valor: string;
  /** Se llama 300 ms después de que el usuario deja de escribir */
  alCambiar: (valor: string) => void;
  placeholder?: string;
  /** Etiqueta accesible (por defecto el placeholder) */
  etiqueta?: string;
  demoraMs?: number;
}

/** Búsqueda con debounce de 300 ms (AGENTS.md §4 UX). */
export function CampoBusqueda({
  valor,
  alCambiar,
  placeholder = 'Buscar…',
  etiqueta,
  demoraMs = 300,
}: CampoBusquedaProps) {
  const [texto, setTexto] = useState(valor);
  const ultimoEnviado = useRef(valor);

  // Si el valor cambia desde fuera (p. ej. URL), se sincroniza
  useEffect(() => {
    if (valor !== ultimoEnviado.current) {
      ultimoEnviado.current = valor;
      setTexto(valor);
    }
  }, [valor]);

  useEffect(() => {
    if (texto === ultimoEnviado.current) return;
    const t = setTimeout(() => {
      ultimoEnviado.current = texto;
      alCambiar(texto);
    }, demoraMs);
    return () => clearTimeout(t);
  }, [texto, alCambiar, demoraMs]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-texto-suave"
        aria-hidden
      />
      <Input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder}
        aria-label={etiqueta ?? placeholder}
        className="pl-9"
      />
    </div>
  );
}

export interface RangoFechas {
  /** "yyyy-MM-dd" */
  desde?: string;
  /** "yyyy-MM-dd" */
  hasta?: string;
}

interface DateRangePickerProps {
  valor: RangoFechas;
  alCambiar: (rango: RangoFechas) => void;
  etiqueta?: string;
}

/** Selector de rango de fechas (valores "yyyy-MM-dd", listos para ?desde=&hasta=). */
export function DateRangePicker({
  valor,
  alCambiar,
  etiqueta = 'Rango de fechas',
}: DateRangePickerProps) {
  const seleccion: DateRange | undefined = valor.desde
    ? {
        from: new Date(`${valor.desde}T00:00:00`),
        to: valor.hasta ? new Date(`${valor.hasta}T00:00:00`) : undefined,
      }
    : undefined;
  const texto = valor.desde
    ? `${formatearFecha(valor.desde)} – ${valor.hasta ? formatearFecha(valor.hasta) : '…'}`
    : etiqueta;

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button variante="contorno" className="justify-start font-normal" aria-label={etiqueta}>
            <CalendarRange aria-hidden />
            <span className={cn(!valor.desde && 'text-texto-suave')}>{texto}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <Calendar
            mode="range"
            selected={seleccion}
            onSelect={(r) =>
              alCambiar({
                desde: r?.from ? aFechaApi(r.from) : undefined,
                hasta: r?.to ? aFechaApi(r.to) : undefined,
              })
            }
          />
        </PopoverContent>
      </Popover>
      {valor.desde && (
        <Button
          variante="fantasma"
          tamano="icono"
          aria-label="Quitar rango de fechas"
          onClick={() => alCambiar({})}
        >
          <X aria-hidden />
        </Button>
      )}
    </div>
  );
}
