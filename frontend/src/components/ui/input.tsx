import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-lg border bg-superficie px-3 text-sm text-texto shadow-sm placeholder:text-texto-suave focus-visible:outline-2 focus-visible:outline-anillo disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-peligro';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(base, 'h-9 py-1', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(base, 'min-h-20 py-2', className)} {...props} />;
}
