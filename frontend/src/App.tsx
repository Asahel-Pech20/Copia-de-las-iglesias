import { useEffect, useState } from 'react';
import { TooltipProvider } from '@/components/ui/popover';
import { Toaster } from '@/components/ui/sonner';
import { UiPage } from '@/dev/UiPage';
import { useTema } from '@/hooks/useTema';
import { api } from '@/lib/api';

// Provisional hasta F1-03 (router y layout)
export function App() {
  useTema();
  const [salud, setSalud] = useState('consultando…');
  useEffect(() => {
    api
      .get<{ data: { status: string } }>('/health')
      .then((res) => setSalud(res.data.data.status))
      .catch(() => setSalud('sin conexión'));
  }, []);

  const enCatalogo = import.meta.env.DEV && window.location.pathname === '/_dev/ui';
  return (
    <TooltipProvider>
      {enCatalogo ? (
        <UiPage />
      ) : (
        <main className="p-8">
          <h1 className="text-xl font-semibold">AppIglesia</h1>
          <p className="text-texto-suave">API: {salud}</p>
        </main>
      )}
      <Toaster />
    </TooltipProvider>
  );
}
