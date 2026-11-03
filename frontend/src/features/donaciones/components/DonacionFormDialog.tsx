import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { CampoFecha, CampoMoneda, SelectEnum } from '@/components/comunes/CamposFormulario';
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
import { Switch } from '@/components/ui/controles';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectorMiembros } from '@/features/miembros/components/SelectorMiembros';
import { errorDeCampo, esErrorApi, normalizarError } from '@/lib/api';
import { ETIQUETAS_CONCEPTO, ETIQUETAS_METODO, opcionesDe } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { Donacion, GuardarDonacion } from '@/types/donaciones';
import { useCrearDonacion, useEditarDonacion } from '../hooks';
import { esquemaDonacion, type FormDonacion } from '../schemas';

const CAMPOS_SERVIDOR = [
  'fecha',
  'monto',
  'conceptoDetalle',
  'miembroId',
  'referencia',
  'notas',
] as const;

interface DonacionFormDialogProps {
  /** Si se pasa, edita; si no, registra una nueva */
  donacion?: Donacion;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}

/** Registrar / editar aportación, pensado para captura rápida (F4-02, F4-03). */
export function DonacionFormDialog({
  donacion,
  abierto,
  alCambiarAbierto,
}: DonacionFormDialogProps) {
  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{donacion ? 'Editar aportación' : 'Registrar aportación'}</DialogTitle>
          <DialogDescription>
            {donacion
              ? 'Las aportaciones anuladas no se pueden editar.'
              : 'Registra una aportación económica. Si no se conoce al donante, márcala como anónima.'}
          </DialogDescription>
        </DialogHeader>
        {abierto && <Formulario donacion={donacion} alTerminar={() => alCambiarAbierto(false)} />}
      </DialogContent>
    </Dialog>
  );
}

const hoy = () => format(new Date(), 'yyyy-MM-dd');

function valoresIniciales(donacion?: Donacion): FormDonacion {
  return {
    fecha: donacion?.fecha ?? hoy(),
    monto: donacion?.monto ?? '',
    concepto: donacion?.concepto ?? 'DIEZMO',
    conceptoDetalle: donacion?.conceptoDetalle ?? '',
    metodo: donacion?.metodo ?? 'EFECTIVO',
    anonima: donacion?.anonima ?? false,
    miembroId: donacion?.miembro?.id ?? null,
    referencia: donacion?.referencia ?? '',
    notas: donacion?.notas ?? '',
  };
}

function Formulario({ donacion, alTerminar }: { donacion?: Donacion; alTerminar: () => void }) {
  const crear = useCrearDonacion();
  const editar = useEditarDonacion();
  const idAnonima = useId();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const registrarOtra = useRef(false);
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormDonacion, unknown, GuardarDonacion>({
    resolver: zodResolver(esquemaDonacion),
    defaultValues: valoresIniciales(donacion),
  });
  const concepto = useWatch({ control, name: 'concepto' });
  const anonima = useWatch({ control, name: 'anonima' });

  const enviar = handleSubmit(async (datos) => {
    setErrorServidor(null);
    const otra = registrarOtra.current;
    try {
      if (donacion) await editar.mutateAsync({ id: donacion.id, datos });
      else await crear.mutateAsync(datos);
      notificar.exito(donacion ? 'Aportación guardada' : 'Aportación registrada');
      if (otra && !donacion) {
        // Conserva fecha, concepto y método para capturar la siguiente más rápido
        const { fecha, concepto: c, metodo } = getValues();
        reset({ ...valoresIniciales(), fecha, concepto: c, metodo });
      } else {
        alTerminar();
      }
    } catch (error) {
      const conCampo =
        esErrorApi(error) &&
        CAMPOS_SERVIDOR.filter((campo) => {
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
      <Controller
        control={control}
        name="fecha"
        render={({ field }) => (
          <FormField label="Fecha" requerido error={errors.fecha?.message}>
            <CampoFecha valor={field.value} alCambiar={(v) => field.onChange(v ?? '')} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="monto"
        render={({ field }) => (
          <FormField label="Monto" requerido error={errors.monto?.message}>
            <CampoMoneda valor={field.value} alCambiar={field.onChange} placeholder="0.00" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="concepto"
        render={({ field }) => (
          <FormField label="Concepto" requerido error={errors.concepto?.message}>
            <SelectEnum
              opciones={opcionesDe(ETIQUETAS_CONCEPTO)}
              valor={field.value}
              alCambiar={field.onChange}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="metodo"
        render={({ field }) => (
          <FormField label="Método de recepción" requerido error={errors.metodo?.message}>
            <SelectEnum
              opciones={opcionesDe(ETIQUETAS_METODO)}
              valor={field.value}
              alCambiar={field.onChange}
            />
          </FormField>
        )}
      />
      {concepto === 'OTRO' && (
        <FormField
          label="Describe el concepto"
          requerido
          error={errors.conceptoDetalle?.message}
          className="sm:col-span-2"
        >
          <Input autoComplete="off" maxLength={150} {...register('conceptoDetalle')} />
        </FormField>
      )}

      <div className="flex flex-col gap-3 rounded-lg border p-3 sm:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor={idAnonima}>Aportación anónima</Label>
            <p className="text-xs text-texto-suave">No se asocia a ningún miembro.</p>
          </div>
          <Controller
            control={control}
            name="anonima"
            render={({ field }) => (
              <Switch
                id={idAnonima}
                checked={field.value}
                onCheckedChange={(valor) => {
                  field.onChange(valor);
                  // Anónima ⇒ sin donante: se limpia el selector
                  if (valor) setValue('miembroId', null, { shouldValidate: false });
                }}
              />
            )}
          />
        </div>
        {!anonima && (
          <Controller
            control={control}
            name="miembroId"
            render={({ field }) => (
              <FormField label="Donante" requerido error={errors.miembroId?.message}>
                <SelectorMiembros
                  valor={field.value}
                  alCambiar={field.onChange}
                  placeholder="Busca un miembro…"
                />
              </FormField>
            )}
          />
        )}
      </div>

      <FormField label="Referencia" error={errors.referencia?.message} hint="Folio, cheque, SPEI…">
        <Input autoComplete="off" maxLength={100} {...register('referencia')} />
      </FormField>
      <FormField label="Notas" error={errors.notas?.message}>
        <Textarea rows={2} maxLength={1000} {...register('notas')} />
      </FormField>

      <DialogFooter className="sm:col-span-2">
        <Button type="button" variante="contorno" onClick={alTerminar} disabled={isSubmitting}>
          Cancelar
        </Button>
        {!donacion && (
          <Button
            type="button"
            variante="secundario"
            disabled={isSubmitting}
            onClick={() => {
              registrarOtra.current = true;
              void enviar();
            }}
          >
            Guardar y registrar otra
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          onClick={() => {
            registrarOtra.current = false;
          }}
        >
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
          {donacion ? 'Guardar' : 'Registrar'}
        </Button>
      </DialogFooter>
    </form>
  );
}
