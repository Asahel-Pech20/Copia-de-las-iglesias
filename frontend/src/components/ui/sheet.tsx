import { X } from 'lucide-react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// Panel lateral (menú móvil). Basado en Dialog de Radix.
export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

export function SheetContent({
  className,
  children,
  lado = 'izquierda',
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & { lado?: 'izquierda' | 'derecha' }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <SheetPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex w-72 max-w-[85vw] flex-col gap-4 bg-superficie p-4 text-texto shadow-lg',
          lado === 'izquierda' ? 'left-0 border-r' : 'right-0 border-l',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-3 top-3 rounded-md p-1 text-texto-suave hover:bg-superficie-suave">
          <X className="size-4" aria-hidden />
          <span className="sr-only">Cerrar</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn('text-base font-semibold', className)} {...props} />;
}

export const SheetDescription = SheetPrimitive.Description;
