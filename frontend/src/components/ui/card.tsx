import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-lg border bg-superficie text-texto shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1 p-4 pb-2', className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('text-base font-semibold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-sm text-texto-suave', className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-4 pt-2', className)} {...props} />;
}

const variantesBadge = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variante: {
        neutro: 'border-borde bg-superficie-suave text-texto',
        primario: 'border-transparent bg-primario text-primario-texto',
        acento: 'border-transparent bg-acento text-acento-texto',
        exito: 'border-exito text-exito',
        alerta: 'border-alerta text-alerta',
        peligro: 'border-peligro text-peligro',
      },
    },
    defaultVariants: { variante: 'neutro' },
  },
);

export function Badge({
  className,
  variante,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof variantesBadge>) {
  return <span className={cn(variantesBadge({ variante }), className)} {...props} />;
}

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-superficie-suave', className)}
      {...props}
    />
  );
}

const variantesAlert = cva('relative w-full rounded-lg border p-3 text-sm [&_svg]:size-4', {
  variants: {
    variante: {
      info: 'border-borde bg-superficie text-texto',
      peligro: 'border-peligro text-peligro',
      exito: 'border-exito text-exito',
    },
  },
  defaultVariants: { variante: 'info' },
});

export function Alert({
  className,
  variante,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof variantesAlert>) {
  return <div role="alert" className={cn(variantesAlert({ variante }), className)} {...props} />;
}
