import { DropdownMenu as MenuPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-40 overflow-hidden rounded-lg border bg-superficie p-1 text-texto shadow-md',
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  peligro,
  ...props
}: ComponentProps<typeof MenuPrimitive.Item> & { peligro?: boolean }) {
  return (
    <MenuPrimitive.Item
      className={cn(
        'flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none focus:bg-superficie-suave data-[disabled]:opacity-50 [&_svg]:size-4',
        peligro && 'text-peligro',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Label>) {
  return <MenuPrimitive.Label className={cn('px-2 py-1.5 text-sm', className)} {...props} />;
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-borde', className)} {...props} />
  );
}
