import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MetaPaginacion } from '@/types/comunes';

interface PaginacionProps {
  /** `meta` de la respuesta de lista */
  meta: MetaPaginacion;
  alCambiarPagina: (pagina: number) => void;
}

/** Controles de paginación para listados (`meta` del contrato). */
export function Paginacion({ meta, alCambiarPagina }: PaginacionProps) {
  if (meta.total === 0) return null;
  const desde = (meta.page - 1) * meta.limit + 1;
  const hasta = Math.min(meta.page * meta.limit, meta.total);
  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-sm"
    >
      <p className="text-texto-suave">
        {desde}–{hasta} de {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variante="contorno"
          tamano="sm"
          disabled={meta.page <= 1}
          onClick={() => alCambiarPagina(meta.page - 1)}
        >
          <ChevronLeft aria-hidden /> Anterior
        </Button>
        <span aria-current="page">
          Página {meta.page} de {Math.max(meta.totalPages, 1)}
        </span>
        <Button
          variante="contorno"
          tamano="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => alCambiarPagina(meta.page + 1)}
        >
          Siguiente <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
