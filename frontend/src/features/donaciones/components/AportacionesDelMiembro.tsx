import { Coins } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { Puede } from '@/components/comunes/Puede';
import { Badge } from '@/components/ui/card';
import { useFormatoMoneda } from '@/hooks/useFormatoMoneda';
import { ETIQUETAS_METODO, formatearFecha } from '@/lib/formato';
import { useDonaciones } from '../hooks';
import { conceptoDe } from '../formato';

interface AportacionesDelMiembroProps {
  miembroId: string;
  /** Cuántas mostrar (las más recientes); el resto se ve en /donaciones */
  limite?: number;
}

/**
 * Pestaña "Aportaciones" del perfil de un miembro (F2-11). Solo se muestra a quien tiene
 * `donaciones:leer`; para los demás no renderiza nada ni pide datos financieros.
 * @example <AportacionesDelMiembro miembroId={miembro.id} />
 */
export function AportacionesDelMiembro(props: AportacionesDelMiembroProps) {
  return (
    <Puede permiso="donaciones:leer">
      <Lista {...props} />
    </Puede>
  );
}

function Lista({ miembroId, limite = 10 }: AportacionesDelMiembroProps) {
  const moneda = useFormatoMoneda();
  const consulta = useDonaciones({ miembroId, incluirAnuladas: true, limit: limite });

  if (consulta.isPending) return <SkeletonTabla filas={3} columnas={3} />;
  if (consulta.isError) {
    return <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />;
  }
  const { data, meta } = consulta.data;
  if (data.length === 0) {
    return <EmptyState icono={Coins} titulo="Este miembro aún no tiene aportaciones" />;
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-texto-suave">
        Total aportado: <strong className="text-texto">{moneda(meta.totalMonto)}</strong> (sin
        anuladas)
      </p>
      <ul aria-label="Aportaciones del miembro" className="flex flex-col divide-y">
        {data.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0">
              <p className={d.anulada ? 'text-texto-suave line-through' : 'font-medium'}>
                {conceptoDe(d)}
              </p>
              <p className="text-sm text-texto-suave">
                {formatearFecha(d.fecha)} · {ETIQUETAS_METODO[d.metodo]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {d.anulada && <Badge variante="peligro">Anulada</Badge>}
              <span
                className={`tabular-nums ${d.anulada ? 'text-texto-suave line-through' : 'font-medium'}`}
              >
                {moneda(d.monto)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {meta.total > data.length && (
        <Link to="/donaciones" className="text-sm text-primario hover:underline">
          Ver todas en Donaciones
        </Link>
      )}
    </div>
  );
}
