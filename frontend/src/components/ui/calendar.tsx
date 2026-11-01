import { es } from 'date-fns/locale';
import type { ComponentProps } from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { cn } from '@/lib/utils';

// Calendario en español (semana inicia en lunes) con los tokens del proyecto
export function Calendar({ className, classNames, ...props }: ComponentProps<typeof DayPicker>) {
  const base = getDefaultClassNames();
  return (
    <DayPicker
      locale={es}
      className={cn('p-1 text-sm', className)}
      classNames={{
        ...base,
        months: 'relative flex flex-col gap-4 sm:flex-row',
        month_caption: 'flex h-8 items-center justify-center font-medium capitalize',
        nav: 'absolute inset-x-0 top-0 flex justify-between',
        button_previous:
          'size-8 rounded-md hover:bg-superficie-suave inline-flex items-center justify-center',
        button_next:
          'size-8 rounded-md hover:bg-superficie-suave inline-flex items-center justify-center',
        weekday: 'w-9 text-xs font-normal text-texto-suave',
        day: 'size-9 p-0 text-center',
        day_button: 'size-9 rounded-md hover:bg-superficie-suave',
        selected: 'rounded-md bg-primario text-primario-texto [&>button]:hover:bg-primario',
        today: 'font-bold text-primario',
        outside: 'text-texto-suave opacity-60',
        disabled: 'opacity-40',
        range_middle: 'rounded-none bg-superficie-suave text-texto',
        chevron: 'size-4 fill-texto',
        ...classNames,
      }}
      {...props}
    />
  );
}
