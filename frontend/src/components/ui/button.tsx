import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const variantesBoton = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anillo disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variante: {
        primario: 'bg-primario text-primario-texto shadow-sm hover:bg-primario/90',
        peligro: 'bg-peligro text-peligro-texto shadow-sm hover:bg-peligro/90',
        contorno: 'border bg-superficie text-texto shadow-sm hover:bg-superficie-suave',
        secundario: 'bg-superficie-suave text-texto hover:bg-superficie-suave/70',
        fantasma: 'text-texto hover:bg-superficie-suave',
        enlace: 'text-primario underline-offset-4 hover:underline',
      },
      tamano: {
        md: 'h-9 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6',
        icono: 'size-9',
      },
    },
    defaultVariants: { variante: 'primario', tamano: 'md' },
  },
);

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof variantesBoton> {
  /** Renderiza el hijo (p. ej. un Link) con los estilos del botón */
  asChild?: boolean;
}

export function Button({ className, variante, tamano, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(variantesBoton({ variante, tamano }), className)} {...props} />;
}
