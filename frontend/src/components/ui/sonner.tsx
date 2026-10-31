import { Toaster as Sonner } from 'sonner';

// Contenedor de toasts; se monta una sola vez en providers.tsx. Uso: toast.success('Miembro guardado')
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{ className: 'font-sans text-sm' }}
    />
  );
}

export { toast } from 'sonner';
