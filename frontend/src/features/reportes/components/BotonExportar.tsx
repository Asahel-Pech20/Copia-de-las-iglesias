import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermiso } from '@/hooks/usePermiso';
import { notificar } from '@/lib/notificar';
import type { FiltrosReporte, FormatoDescarga, TipoReporte } from '@/types/reportes';
import { useDescargarReporte } from '../hooks';
import { permisosDeReporte } from '../permisos';

interface BotonExportarProps {
  tipo: TipoReporte;
  /** Filtros actuales de la pantalla; se envían tal cual a la descarga */
  filtros?: FiltrosReporte;
  etiqueta?: string;
  className?: string;
}

/**
 * Menú "Exportar" con PDF y Excel. Se oculta solo si el usuario no puede ver ese reporte, así
 * F2/F3 pueden colocarlo sin revisar permisos.
 * @example <BotonExportar tipo="miembros" filtros={{ estado: 'activo' }} />
 */
export function BotonExportar({
  tipo,
  filtros = {},
  etiqueta = 'Exportar',
  className,
}: BotonExportarProps) {
  const permitido = usePermiso(...permisosDeReporte(tipo));
  const descargar = useDescargarReporte();
  if (!permitido) return null;

  function pedir(formato: FormatoDescarga) {
    descargar.mutate(
      { tipo, filtros, formato },
      {
        onSuccess: (archivo) => notificar.exito(`Descargado ${archivo.nombre}`),
        onError: notificar.error,
      },
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variante="contorno" className={className} disabled={descargar.isPending}>
          {descargar.isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <Download aria-hidden />
          )}
          {descargar.isPending ? 'Descargando…' : etiqueta}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => pedir('pdf')}>
          <FileText aria-hidden /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => pedir('xlsx')}>
          <FileSpreadsheet aria-hidden /> Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
