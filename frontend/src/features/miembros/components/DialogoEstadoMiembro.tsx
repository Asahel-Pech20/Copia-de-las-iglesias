import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { notificar } from '@/lib/notificar';
import type { Miembro } from '@/types/miembros';
import { useCambiarEstadoMiembro } from '../hooks';

interface Props {
  /** Miembro a desactivar o reactivar; null cierra el diálogo */
  miembro: Pick<Miembro, 'id' | 'nombre' | 'apellidos' | 'activo'> | null;
  alCerrar: () => void;
}

/** Confirmación para desactivar (con motivo opcional) o reactivar un miembro (F2-03). */
export function DialogoEstadoMiembro({ miembro, alCerrar }: Props) {
  const cambiarEstado = useCambiarEstadoMiembro();
  const desactivar = miembro?.activo ?? true;
  const nombre = miembro ? `${miembro.nombre} ${miembro.apellidos}` : '';

  return (
    <ConfirmDialog
      abierto={miembro !== null}
      alCambiarAbierto={(abierto) => !abierto && alCerrar()}
      titulo={desactivar ? 'Desactivar miembro' : 'Reactivar miembro'}
      descripcion={
        desactivar
          ? `${nombre} dejará de aparecer en los listados de activos y saldrá de sus ministerios. Se conservará todo su historial de asistencia y aportaciones.`
          : `${nombre} volverá a aparecer como activo. Sus ministerios anteriores no se restauran automáticamente.`
      }
      textoConfirmar={desactivar ? 'Desactivar' : 'Reactivar'}
      peligro={desactivar}
      motivo={desactivar ? 'opcional' : 'no'}
      alConfirmar={async (motivo) => {
        await cambiarEstado.mutateAsync({ id: miembro!.id, activo: !desactivar, motivo });
        notificar.exito(desactivar ? 'Miembro desactivado' : 'Miembro reactivado');
      }}
    />
  );
}
