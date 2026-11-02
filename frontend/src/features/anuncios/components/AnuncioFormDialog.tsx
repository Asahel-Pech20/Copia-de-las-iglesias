import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { FormField } from '@/components/comunes/FormField';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEventosProximos } from '@/features/eventos/hooks';
import { errorDeCampo, esErrorApi, normalizarError } from '@/lib/api';
import { ETIQUETAS_PRIORIDAD_ANUNCIO, formatearFechaHora, opcionesDe } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { Anuncio, GuardarAnuncio } from '@/types/anuncios';
import { useCrearAnuncio, useEditarAnuncio } from '../hooks';
import { esquemaAnuncio, type FormAnuncio, SIN_EVENTO } from '../schemas';
import { MarkdownSimple } from './MarkdownSimple';

/** ISO → valor de <input type="datetime-local"> en hora local */
const aLocal = (iso: string | Date) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm");

interface AnuncioFormDialogProps {
  /** Si se pasa, edita; si no, crea */
  anuncio?: Anuncio;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}

/** Crear / editar anuncio con vista previa del markdown (F3-11). */
export function AnuncioFormDialog({ anuncio, abierto, alCambiarAbierto }: AnuncioFormDialogProps) {
  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{anuncio ? 'Editar anuncio' : 'Nuevo anuncio'}</DialogTitle>
          <DialogDescription>
            Admite markdown simple: **negrita**, *cursiva*, listas con "- " y enlaces.
          </DialogDescription>
        </DialogHeader>
        {abierto && <Formulario anuncio={anuncio} alTerminar={() => alCambiarAbierto(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({ anuncio, alTerminar }: { anuncio?: Anuncio; alTerminar: () => void }) {
  const crear = useCrearAnuncio();
  const editar = useEditarAnuncio();
  const { data: proximos } = useEventosProximos(20);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormAnuncio, unknown, GuardarAnuncio>({
    resolver: zodResolver(esquemaAnuncio),
    defaultValues: {
      titulo: anuncio?.titulo ?? '',
      contenido: anuncio?.contenido ?? '',
      prioridad: anuncio?.prioridad ?? 'NORMAL',
      fechaPublicacion: aLocal(anuncio?.fechaPublicacion ?? new Date()),
      fechaExpiracion: anuncio?.fechaExpiracion ? aLocal(anuncio.fechaExpiracion) : '',
      eventoId: anuncio?.evento?.id ?? SIN_EVENTO,
    },
  });
  const contenido = useWatch({ control, name: 'contenido' });

  // Evento vinculado: próximos eventos (y el actual, aunque ya haya pasado)
  const opcionesEvento = [
    { valor: SIN_EVENTO, etiqueta: 'Sin evento' },
    ...(anuncio?.evento && !proximos?.some((e) => e.id === anuncio.evento!.id)
      ? [{ valor: anuncio.evento.id, etiqueta: anuncio.evento.titulo }]
      : []),
    ...(proximos ?? []).map((e) => ({
      valor: e.id,
      etiqueta: `${e.titulo} (${formatearFechaHora(e.fechaInicio)})`,
    })),
  ];

  const enviar = handleSubmit(async (datos) => {
    setErrorServidor(null);
    try {
      if (anuncio) await editar.mutateAsync({ id: anuncio.id, datos });
      else await crear.mutateAsync(datos);
      notificar.exito(anuncio ? 'Anuncio guardado' : 'Anuncio publicado');
      alTerminar();
    } catch (error) {
      const campos = ['titulo', 'contenido', 'fechaPublicacion', 'fechaExpiracion'] as const;
      const conCampo =
        esErrorApi(error) &&
        campos.filter((campo) => {
          const mensaje = errorDeCampo(error, campo);
          if (mensaje) setError(campo, { message: mensaje });
          return Boolean(mensaje);
        }).length > 0;
      if (!conCampo) setErrorServidor(normalizarError(error).message);
    }
  });

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4 sm:grid-cols-2">
      {errorServidor && (
        <Alert variante="peligro" className="sm:col-span-2">
          {errorServidor}
        </Alert>
      )}
      <FormField label="Título" requerido error={errors.titulo?.message} className="sm:col-span-2">
        <Input autoComplete="off" maxLength={120} {...register('titulo')} />
      </FormField>
      <Tabs defaultValue="escribir" className="sm:col-span-2">
        <TabsList>
          <TabsTrigger value="escribir">Escribir</TabsTrigger>
          <TabsTrigger value="vista">Vista previa</TabsTrigger>
        </TabsList>
        <TabsContent value="escribir">
          <FormField label="Contenido" requerido error={errors.contenido?.message}>
            <Textarea rows={6} maxLength={5000} {...register('contenido')} />
          </FormField>
        </TabsContent>
        <TabsContent value="vista">
          <div aria-label="Vista previa" className="min-h-32 rounded-lg border p-3 text-sm">
            {contenido?.trim() ? (
              <MarkdownSimple texto={contenido} />
            ) : (
              <p className="text-texto-suave">Nada que mostrar todavía.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Controller
        control={control}
        name="prioridad"
        render={({ field }) => (
          <FormField label="Prioridad" requerido>
            <SelectEnum
              opciones={opcionesDe(ETIQUETAS_PRIORIDAD_ANUNCIO)}
              valor={field.value}
              alCambiar={field.onChange}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="eventoId"
        render={({ field }) => (
          <FormField label="Evento vinculado">
            <SelectEnum opciones={opcionesEvento} valor={field.value} alCambiar={field.onChange} />
          </FormField>
        )}
      />
      <FormField
        label="Publicación"
        requerido
        error={errors.fechaPublicacion?.message}
        hint="Puedes programarlo a futuro."
      >
        <Input type="datetime-local" {...register('fechaPublicacion')} />
      </FormField>
      <FormField label="Expiración" error={errors.fechaExpiracion?.message} hint="Opcional.">
        <Input type="datetime-local" {...register('fechaExpiracion')} />
      </FormField>
      <DialogFooter className="sm:col-span-2">
        <Button type="button" variante="contorno" onClick={alTerminar} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
          {anuncio ? 'Guardar' : 'Publicar'}
        </Button>
      </DialogFooter>
    </form>
  );
}
