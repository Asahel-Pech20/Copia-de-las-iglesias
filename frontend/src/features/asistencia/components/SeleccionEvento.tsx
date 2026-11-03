import { CalendarPlus, ClipboardCheck, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { CampoFecha } from '@/components/comunes/CamposFormulario';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { FormField } from '@/components/comunes/FormField';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useHorarios } from '@/features/configuracion/hooks';
import { BadgeEstadoEvento } from '@/features/eventos/components/categorias';
import { ESTILO_CATEGORIA } from '@/features/eventos/estilos';
import { useCrearEvento, useEventos } from '@/features/eventos/hooks';
import { usePuedeGestionar } from '@/features/eventos/permisos';
import { usePermiso } from '@/hooks/usePermiso';
import { aFechaApi, formatearFechaHora } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import { cn } from '@/lib/utils';

interface SeleccionEventoProps {
  /** "yyyy-MM-dd" */
  fecha: string;
  alCambiarFecha: (fecha: string) => void;
}

/** Eventos del día elegido para pasar lista; COORDINADOR solo ve los de sus ministerios (F3-06). */
export function SeleccionEvento({ fecha, alCambiarFecha }: SeleccionEventoProps) {
  const navegar = useNavigate();
  // Fecha sola: el backend toma el día completo en la zona horaria de la iglesia
  const consulta = useEventos({ desde: fecha, hasta: fecha });
  const puedeLeer = usePuedeGestionar('asistencia:leer', 'asistencia:leer-propio');
  const puedeCrearRapido = usePermiso('eventos:crear');
  const crear = useCrearEvento();
  const { data: horarios } = useHorarios();

  const eventos = (consulta.data?.data ?? []).filter(
    (e) => e.estado !== 'CANCELADO' && puedeLeer(e.ministerio?.id),
  );

  /** Culto rápido a la hora actual (si es hoy) o a las 10:00, en el lugar habitual. */
  async function crearCultoRapido() {
    const esHoy = fecha === aFechaApi(new Date());
    const fechaInicio = esHoy ? new Date() : new Date(`${fecha}T10:00:00`);
    try {
      const evento = await crear.mutateAsync({
        titulo: 'Culto',
        tipo: 'RELIGIOSO',
        categoria: 'CULTO',
        fechaInicio: fechaInicio.toISOString(),
        lugar: horarios?.find((h) => h.activo && h.lugar)?.lugar ?? 'Templo',
      });
      notificar.exito('Evento creado');
      navegar(`/eventos/${evento.id}/asistencia`);
    } catch (error) {
      notificar.error(error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Fecha" className="sm:max-w-xs">
        <CampoFecha valor={fecha} alCambiar={(v) => alCambiarFecha(v ?? aFechaApi(new Date()))} />
      </FormField>
      <Card>
        {consulta.isPending ? (
          <SkeletonTabla filas={3} columnas={2} />
        ) : consulta.isError ? (
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        ) : eventos.length === 0 ? (
          <EmptyState
            titulo="No hay eventos este día"
            descripcion="La asistencia se registra sobre un evento."
            accion={
              puedeCrearRapido && (
                <Button onClick={crearCultoRapido} disabled={crear.isPending}>
                  {crear.isPending ? (
                    <Loader2 className="animate-spin" aria-hidden />
                  ) : (
                    <CalendarPlus aria-hidden />
                  )}
                  Crear evento rápido (culto)
                </Button>
              )
            }
          />
        ) : (
          <ul aria-label="Eventos del día" className="flex flex-col divide-y">
            {eventos.map((e) => {
              const { clase, icono: Icono } = ESTILO_CATEGORIA[e.categoria];
              return (
                <li key={e.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  {/* En móvil: datos arriba y acciones abajo, a todo el ancho */}
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      className={cn(
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg',
                        clase,
                      )}
                    >
                      <Icono className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{e.titulo}</p>
                      <p className="text-sm text-texto-suave">
                        {formatearFechaHora(e.fechaInicio)} · {e.lugar}
                        {e.ministerio && ` · ${e.ministerio.nombre}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <BadgeEstadoEvento estado={e.estado} />
                    <Button asChild className="min-h-11">
                      <Link to={`/eventos/${e.id}/asistencia`}>
                        <ClipboardCheck aria-hidden /> Pasar lista
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
