import { CalendarDays } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConfiguracion } from '@/features/configuracion/hooks';
import { aFechaApi, formatearFecha } from '@/lib/formato';
import { cn } from '@/lib/utils';

type PropsControl = Pick<
  ComponentProps<'button'>,
  'id' | 'aria-invalid' | 'aria-describedby' | 'aria-required' | 'disabled'
>;

interface SelectEnumProps<T extends string> extends PropsControl {
  /** Opciones; con `opcionesDe(ETIQUETAS_…)` de lib/formato.ts */
  opciones: { valor: T; etiqueta: string }[];
  valor: T | undefined;
  alCambiar: (valor: T) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Select para valores de un enum con etiquetas en español.
 * @example <SelectEnum opciones={opcionesDe(ETIQUETAS_ROL)} valor={rol} alCambiar={setRol} />
 */
export function SelectEnum<T extends string>({
  opciones,
  valor,
  alCambiar,
  placeholder = 'Selecciona…',
  className,
  ...control
}: SelectEnumProps<T>) {
  return (
    <Select
      value={valor ?? ''}
      onValueChange={(v) => alCambiar(v as T)}
      disabled={control.disabled}
    >
      <SelectTrigger className={className} {...control}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.etiqueta}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface CampoFechaProps extends PropsControl {
  /** "yyyy-MM-dd" o null */
  valor: string | null | undefined;
  alCambiar: (valor: string | null) => void;
  placeholder?: string;
  className?: string;
}

/** Selector de fecha (valor "yyyy-MM-dd", el formato de los campos @db.Date). */
export function CampoFecha({
  valor,
  alCambiar,
  placeholder = 'Selecciona una fecha',
  className,
  ...control
}: CampoFechaProps) {
  const [abierto, setAbierto] = useState(false);
  const fecha = valor ? new Date(`${valor}T00:00:00`) : undefined;
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variante="contorno"
          className={cn('w-full justify-start font-normal', className)}
          {...control}
        >
          <CalendarDays aria-hidden />
          <span className={cn(!valor && 'text-texto-suave')}>
            {valor ? formatearFecha(valor) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <Calendar
          mode="single"
          selected={fecha}
          defaultMonth={fecha}
          captionLayout="dropdown"
          onSelect={(d) => {
            alCambiar(d ? aFechaApi(d) : null);
            setAbierto(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

interface CampoMonedaProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  /** Monto como string con 2 decimales ("1500.00"), igual que en la API */
  valor: string;
  alCambiar: (valor: string) => void;
}

/**
 * Campo de monto con el símbolo de la moneda configurada. Acepta hasta 2 decimales
 * y entrega un string ("1500.50") listo para la API.
 */
export function CampoMoneda({ valor, alCambiar, className, ...props }: CampoMonedaProps) {
  const { data: config } = useConfiguracion();
  const moneda = config?.moneda ?? 'MXN';
  const simbolo =
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value ?? '$';

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-texto-suave"
        aria-hidden
      >
        {simbolo}
      </span>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={valor}
        onChange={(e) => {
          const limpio = e.target.value.replace(/,/g, '');
          if (/^\d*(\.\d{0,2})?$/.test(limpio)) alCambiar(limpio);
        }}
        onBlur={(e) => {
          if (valor && !Number.isNaN(Number(valor))) alCambiar(Number(valor).toFixed(2));
          props.onBlur?.(e);
        }}
        className={cn('pl-8 pr-14 text-right tabular-nums', className)}
      />
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-texto-suave"
        aria-hidden
      >
        {moneda}
      </span>
    </div>
  );
}
