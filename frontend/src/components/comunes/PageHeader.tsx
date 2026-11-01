import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** Título de la página (h1) */
  titulo: string;
  /** Texto secundario bajo el título */
  descripcion?: ReactNode;
  /** Botones de acción a la derecha (p. ej. "Nuevo miembro") */
  acciones?: ReactNode;
}

/**
 * Encabezado estándar de toda página: título + acciones (AGENTS.md §4 Layout).
 * @example <PageHeader titulo="Miembros" acciones={<Button>Nuevo miembro</Button>} />
 */
export function PageHeader({ titulo, descripcion, acciones }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold">{titulo}</h1>
        {descripcion && <p className="mt-1 text-texto-suave">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}
