import { AlertTriangle, Inbox, type LucideIcon, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, Skeleton } from '@/components/ui/card';
import { normalizarError } from '@/lib/api';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Ícono de lucide-react (por defecto Inbox) */
  icono?: LucideIcon;
  titulo: string;
  descripcion?: ReactNode;
  /** Acción sugerida, p. ej. <Button>Registrar el primero</Button> */
  accion?: ReactNode;
  className?: string;
}

/** Estado vacío de una vista de datos (obligatorio en cada listado, AGENTS.md §4). */
export function EmptyState({
  icono: Icono = Inbox,
  titulo,
  descripcion,
  accion,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-4 py-12 text-center', className)}>
      <Icono className="size-10 text-texto-suave" aria-hidden />
      <p className="text-base font-medium">{titulo}</p>
      {descripcion && <p className="max-w-sm text-texto-suave">{descripcion}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}

interface ErrorStateProps {
  /** Error de TanStack Query (se normaliza a ErrorApi para mostrar su mensaje) */
  error: unknown;
  /** Si se pasa, muestra el botón "Reintentar" (normalmente `refetch`) */
  alReintentar?: () => void;
  className?: string;
}

/** Estado de error con mensaje del servidor y botón reintentar. */
export function ErrorState({ error, alReintentar, className }: ErrorStateProps) {
  const { message } = normalizarError(error);
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-2 px-4 py-12 text-center', className)}
    >
      <AlertTriangle className="size-10 text-peligro" aria-hidden />
      <p className="text-base font-medium">No se pudo cargar la información</p>
      <p className="max-w-sm text-texto-suave">{message}</p>
      {alReintentar && (
        <Button variante="contorno" className="mt-2" onClick={alReintentar}>
          <RotateCw aria-hidden /> Reintentar
        </Button>
      )}
    </div>
  );
}

/** Esqueleto de carga para tablas. */
export function SkeletonTabla({ filas = 5, columnas = 4 }: { filas?: number; columnas?: number }) {
  return (
    <div className="flex flex-col gap-3 p-4" role="status" aria-label="Cargando">
      {Array.from({ length: filas }, (_, f) => (
        <div key={f} className="flex gap-4">
          {Array.from({ length: columnas }, (_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface StatCardProps {
  titulo: string;
  /** Valor ya formateado ("120", "$15,230.00") */
  valor: ReactNode;
  descripcion?: ReactNode;
  icono?: LucideIcon;
  cargando?: boolean;
}

/** Tarjeta de indicador para el dashboard. */
export function StatCard({ titulo, valor, descripcion, icono: Icono, cargando }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-sm text-texto-suave">{titulo}</p>
          {cargando ? (
            <Skeleton className="mt-2 h-7 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-semibold">{valor}</p>
          )}
          {descripcion && <p className="mt-1 text-xs text-texto-suave">{descripcion}</p>}
        </div>
        {Icono && (
          <span className="rounded-lg bg-superficie-suave p-2 text-primario">
            <Icono className="size-5" aria-hidden />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
