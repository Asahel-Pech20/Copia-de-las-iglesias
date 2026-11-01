import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { FormField } from '@/components/comunes/FormField';
import { BadgeEstado } from '@/components/comunes/BadgeEstado';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/controles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { errorDeCampo } from '@/lib/api';
import { DIAS_SEMANA } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { HorarioReunion } from '@/types/configuracion';
import { useEliminarHorario, useGuardarHorario, useHorarios } from '../hooks';
import { type DatosHorario, esquemaHorario, type HorarioValidado } from '../schemas';

const OPCIONES_DIA = DIAS_SEMANA.map((etiqueta, i) => ({ valor: String(i), etiqueta }));

function HorarioFormDialog({
  abierto,
  alCambiarAbierto,
  horario,
}: {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  horario?: HorarioReunion;
}) {
  const guardar = useGuardarHorario();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosHorario, unknown, HorarioValidado>({ resolver: zodResolver(esquemaHorario) });

  useEffect(() => {
    if (!abierto) return;
    reset(
      horario
        ? {
            ...horario,
            horaFin: horario.horaFin ?? '',
            lugar: horario.lugar ?? '',
          }
        : { nombre: '', diaSemana: 0, horaInicio: '', horaFin: '', lugar: '', activo: true },
    );
  }, [abierto, horario, reset]);

  const enviar = handleSubmit(async (datos) => {
    try {
      await guardar.mutateAsync({ id: horario?.id, datos });
      notificar.exito(horario ? 'Horario actualizado' : 'Horario agregado');
      alCambiarAbierto(false);
    } catch (error) {
      const mensaje = errorDeCampo(error, 'horaFin');
      if (mensaje) setError('horaFin', { message: mensaje });
      else notificar.error(error);
    }
  });

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{horario ? 'Editar horario' : 'Nuevo horario'}</DialogTitle>
          <DialogDescription>
            Reunión habitual que se muestra en la cartelera pública.
          </DialogDescription>
        </DialogHeader>
        <form id="form-horario" onSubmit={enviar} noValidate className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Nombre"
            requerido
            error={errors.nombre?.message}
            className="sm:col-span-2"
          >
            <Input placeholder="Culto dominical" {...register('nombre')} />
          </FormField>
          <Controller
            control={control}
            name="diaSemana"
            render={({ field }) => (
              <FormField label="Día" requerido className="sm:col-span-2">
                <SelectEnum
                  opciones={OPCIONES_DIA}
                  valor={String(field.value)}
                  alCambiar={(v) => field.onChange(Number(v))}
                />
              </FormField>
            )}
          />
          <FormField label="Hora de inicio" requerido error={errors.horaInicio?.message}>
            <Input type="time" {...register('horaInicio')} />
          </FormField>
          <FormField label="Hora de fin" error={errors.horaFin?.message}>
            <Input type="time" {...register('horaFin')} />
          </FormField>
          <FormField label="Lugar" error={errors.lugar?.message} className="sm:col-span-2">
            <Input placeholder="Templo principal" {...register('lugar')} />
          </FormField>
          <Controller
            control={control}
            name="activo"
            render={({ field }) => (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Switch
                  id="horario-activo"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="horario-activo">Activo</Label>
              </div>
            )}
          />
        </form>
        <DialogFooter>
          <Button variante="contorno" onClick={() => alCambiarAbierto(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="form-horario" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Pestaña Horarios: lista agrupada por día; solo ADMIN agrega, edita y elimina. */
export function Horarios({ editable }: { editable: boolean }) {
  const consulta = useHorarios();
  const eliminar = useEliminarHorario();
  const [formulario, setFormulario] = useState<{ abierto: boolean; horario?: HorarioReunion }>({
    abierto: false,
  });
  const [porEliminar, setPorEliminar] = useState<HorarioReunion | null>(null);

  const nuevo = editable && (
    <Button onClick={() => setFormulario({ abierto: true })}>
      <Plus aria-hidden /> Agregar horario
    </Button>
  );

  if (consulta.isPending) return <SkeletonTabla filas={3} columnas={3} />;
  if (consulta.isError) {
    return <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />;
  }

  const porDia = DIAS_SEMANA.map((dia, i) => ({
    dia,
    horarios: consulta.data.filter((h) => h.diaSemana === i),
  })).filter((g) => g.horarios.length > 0);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {porDia.length === 0 ? (
        <Card>
          <EmptyState
            icono={CalendarClock}
            titulo="Sin horarios registrados"
            descripcion="Agrega las reuniones habituales de la iglesia."
            accion={nuevo}
          />
        </Card>
      ) : (
        <>
          {nuevo && <div>{nuevo}</div>}
          {porDia.map(({ dia, horarios }) => (
            <section key={dia} aria-labelledby={`dia-${dia}`}>
              <h3 id={`dia-${dia}`} className="mb-2 text-sm font-semibold text-texto-suave">
                {dia}
              </h3>
              <Card>
                <ul className="divide-y">
                  {horarios.map((h) => (
                    <li key={h.id} className="flex flex-wrap items-center gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{h.nombre}</p>
                        <p className="text-texto-suave">
                          {h.horaInicio}
                          {h.horaFin && ` – ${h.horaFin}`}
                          {h.lugar && ` · ${h.lugar}`}
                        </p>
                      </div>
                      {!h.activo && <BadgeEstado activo={false} />}
                      {editable && (
                        <div className="flex gap-1">
                          <Button
                            variante="fantasma"
                            tamano="icono"
                            aria-label={`Editar ${h.nombre}`}
                            onClick={() => setFormulario({ abierto: true, horario: h })}
                          >
                            <Pencil aria-hidden />
                          </Button>
                          <Button
                            variante="fantasma"
                            tamano="icono"
                            aria-label={`Eliminar ${h.nombre}`}
                            onClick={() => setPorEliminar(h)}
                          >
                            <Trash2 className="text-peligro" aria-hidden />
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </>
      )}

      <HorarioFormDialog
        abierto={formulario.abierto}
        horario={formulario.horario}
        alCambiarAbierto={(abierto) => setFormulario((f) => ({ ...f, abierto }))}
      />
      <ConfirmDialog
        abierto={porEliminar !== null}
        alCambiarAbierto={(abierto) => !abierto && setPorEliminar(null)}
        titulo="Eliminar horario"
        descripcion={`Se eliminará "${porEliminar?.nombre}". Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        peligro
        alConfirmar={async () => {
          await eliminar.mutateAsync(porEliminar!.id);
          notificar.exito('Horario eliminado');
        }}
      />
    </div>
  );
}
