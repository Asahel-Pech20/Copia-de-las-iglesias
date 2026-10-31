import { TooltipProvider } from '@/components/ui/popover';
import { Toaster } from '@/components/ui/sonner';
import { UiPage } from '@/dev/UiPage';
import { useTema } from '@/hooks/useTema';

// Provisional hasta F1-03 (router y layout)
export function App() {
  useTema();
  const enCatalogo = import.meta.env.DEV && window.location.pathname === '/_dev/ui';
  return (
    <TooltipProvider>
      {enCatalogo ? <UiPage /> : <h1>AppIglesia</h1>}
      <Toaster />
    </TooltipProvider>
  );
}
