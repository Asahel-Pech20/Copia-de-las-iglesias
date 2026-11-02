import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { CampoFecha, SelectEnum } from '@/components/comunes/CamposFormulario';
import { ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { FormField } from '@/components/comunes/FormField';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Button } from '@/components/ui/button';
import { Alert, Card, CardContent } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { useHorarios } from '@/features/configuracion/hooks';
import { useMinisterios } from '@/features/ministerios/hooks';
import { usePermiso } from '@/hooks/usePermiso';
import { errorDeCampo, esErrorApi, normalizarError } from '@/lib/api';
import {
  aFechaApi,
  ETIQUETAS_CATEGORIA_EVENTO,
  ETIQUETAS_TIPO_EVENTO,
  opcionesDe,
} from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { EventoDetalle, GuardarEvento } from '@/types/eventos';
import { useCrearEvento, useEditarEvento, useEvento } from '../hooks';
import { useMinisteriosCoordinados } from '../permisos';
import { crearEsquemaEvento, type FormEvento, SIN_MINISTERIO } from '../schemas';

const hora = (iso: string) => format(new Date(iso), 'HH:mm');

/** /eventos/nuevo (acepta ?fecha= y ?ministerioId=) y /eventos/:id/editar (F3-02). */
export function EventoFormPage() {
  const { id } = useParams();
  const consulta = useEvento(id);
  const titulo = id ? 'Editar evento' : 'Nuevo evento';

  if (id && consulta.isPending) {
    return (
      <>
        <PageHeader titulo={titulo} />
        <Card>
          <SkeletonTabla filas={4} columnas={2} />
        </Card>
      </>
    );
  }
  if (id && consulta.isError) {
    return (
      <>
        <PageHeader titulo={titulo} />
        <Card>
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        </Card>
      </>
    );
  }
  return <FormularioEvento key={id ?? 'nuevo'} evento={consulta.data} />;
}

function FormularioEvento({ evento }: { evento?: EventoDetalle }) {
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const crear = useCrearEvento();
  const editar = useEditarEvento();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  // COORDINADOR (solo "-propio"): el ministerio es obligatorio y solo puede elegir los suyos
  const completo = usePermiso(evento ? 'eventos:editar' : 'eventos:crear');
  const coordinados = useMinisteriosCoordinados();
  const { data: ministerios } = useMinisterios();
  const { data: horarios } = useHorarios();
  const opcionesMinisterio = [
    ...(completo ? [{ valor: SIN_MINISTERIO, etiqueta: 'Sin ministerio (general)' }] : []),
    ...(ministerios?.data ?? [])
      .filter((m) => completo || coordinados.includes(m.id))
      .map((m) => ({ valor: m.id, etiqueta: m.nombre })),
  ];
  // Lugares sugeridos: los de los horarios de reunión configurados
  const lugares = [...new Set((horarios ?? []).map((h) => h.lugar).filter(Boolean))] as string[];

  const esquema = useMemo(
    () => crearEsquemaEvento({ ministerioObligatorio: !completo }),
    [completo],
  );
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormEvento, unknown, GuardarEvento>({
    resolver: zodResolver(esquema),
    defaultValues: {
      titulo: evento?.titulo ?? '',
      tipo: evento?.tipo ?? 'RELIGIOSO',
      categoria: evento?.categoria ?? 'CULTO',
      fecha: evento
        ? aFechaApi(new Date(evento.fechaInicio))
        : (params.get('fecha') ?? aFechaApi(new Date())),
      horaInicio: evento ? hora(evento.fechaInicio) : '10:00',
      horaFin: evento?.fechaFin ? hora(evento.fechaFin) : '',
      lugar: evento?.lugar ?? '',
      descripcion: evento?.descripcion ?? '',
      ministerioId:
        evento?.ministerio?.id ?? params.get('ministerioId') ?? (completo ? SIN_MINISTERIO : ''),
    },
  });

  const enviar = handleSubmit(async (datos) => {
    setErrorServidor(null);
    try {
      const guardado = evento
        ? await editar.mutateAsync({ id: evento.id, datos })
        : await crear.mutateAsync(datos);
      notificar.exito('Evento guardado');
      navegar(`/eventos/${guardado.id}`);
    } catch (error) {
      // Errores de campo del backend van a su campo; fechaFin se muestra en la hora de fin
      const campos: [string, keyof FormEvento][] = [
        ['titulo', 'titulo'],
        ['lugar', 'lugar'],
        ['descripcion', 'descripcion'],
        ['fechaInicio', 'horaInicio'],
        ['fechaFin', 'horaFin'],
        ['ministerioId', 'ministerioId'],
      ];
      const conCampo =
        esErrorApi(error) &&
        campos.filter(([api, campo]) => {
          const mensaje = errorDeCampo(error, api);
          if (mensaje) setError(campo, { message: mensaje });
          return Boolean(mensaje);
        }).length > 0;
      if (!conCampo) setErrorServidor(normalizarError(error).message);
    }
  });

  const volver = evento ? `/eventos/${evento.id}` : '/eventos';

  return (
    <>
      <PageHeader
        titulo={evento ? 'Editar evento' : 'Nuevo evento'}
        descripcion={evento?.titulo}
        acciones={
          <Button variante="contorno" asChild>
            <Link to={volver}>
              <ArrowLeft aria-hidden /> Volver
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={enviar} noValidate className="grid gap-4 sm:grid-cols-2">
            {errorServidor && (
              <Alert variante="peligro" className="sm:col-span-2">
                {errorServidor}
              </Alert>
            )}
            <FormField
              label="Título"
              requerido
              error={errors.titulo?.message}
              className="sm:col-span-2"
            >
              <Input autoComplete="off" {...register('titulo')} />
            </FormField>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <FormField label="Tipo" requerido error={errors.tipo?.message}>
                  <SelectEnum
                    opciones={opcionesDe(ETIQUETAS_TIPO_EVENTO)}
                    valor={field.value}
                    alCambiar={field.onChange}
                  />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <FormField label="Categoría" requerido error={errors.categoria?.message}>
                  <SelectEnum
                    opciones={opcionesDe(ETIQUETAS_CATEGORIA_EVENTO)}
                    valor={field.value}
                    alCambiar={field.onChange}
                  />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="fecha"
              render={({ field }) => (
                <FormField label="Fecha" requerido error={errors.fecha?.message}>
                  <CampoFecha valor={field.value} alCambiar={(v) => field.onChange(v ?? '')} />
                </FormField>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Hora de inicio" requerido error={errors.horaInicio?.message}>
                <Input type="time" {...register('horaInicio')} />
              </FormField>
              <FormField label="Hora de fin" error={errors.horaFin?.message}>
                <Input type="time" {...register('horaFin')} />
              </FormField>
            </div>
            <FormField
              label="Lugar"
              requerido
              error={errors.lugar?.message}
              hint={lugares.length > 0 ? 'Puedes elegir uno de los lugares habituales.' : undefined}
            >
              <Input autoComplete="off" list="lugares-habituales" {...register('lugar')} />
            </FormField>
            <datalist id="lugares-habituales">
              {lugares.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            <Controller
              control={control}
              name="ministerioId"
              render={({ field }) => (
                <FormField
                  label="Ministerio"
                  requerido={!completo}
                  error={errors.ministerioId?.message}
                >
                  <SelectEnum
                    opciones={opcionesMinisterio}
                    valor={field.value || undefined}
                    alCambiar={field.onChange}
                    placeholder="Elige un ministerio"
                  />
                </FormField>
              )}
            />
            <FormField
              label="Descripción"
              error={errors.descripcion?.message}
              className="sm:col-span-2"
            >
              <Textarea {...register('descripcion')} />
            </FormField>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button variante="contorno" asChild>
                <Link to={volver}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
                Guardar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
