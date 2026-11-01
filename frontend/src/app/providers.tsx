import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/popover';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { useTema } from '@/hooks/useTema';
import { queryClient as clientePorDefecto } from '@/lib/queryClient';

function AplicarTema() {
  useTema();
  return null;
}

/** Proveedores globales: TanStack Query → sesión → tooltips + toasts. */
export function Providers({
  children,
  queryClient = clientePorDefecto,
}: {
  children: ReactNode;
  queryClient?: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider delayDuration={300}>
          <AplicarTema />
          {children}
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
