import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SelectEnum } from '@/components/comunes/CamposFormulario';
import { FormField } from '@/components/comunes/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorDeCampo } from '@/lib/api';
import { opcionesDe } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { ConfiguracionIglesia } from '@/types/configuracion';
import { MONEDAS, ZONAS_HORARIAS } from '../catalogos';
import { useActualizarConfiguracion } from '../hooks';
import { type DatosConfiguracion, esquemaConfiguracion } from '../schemas';

const CAMPOS_TEXTO = ['direccion', 'ciudad', 'telefono', 'email', 'sitioWeb'] as const;

const ETIQUETAS: Record<(typeof CAMPOS_TEXTO)[number], string> = {
  direccion: 'Dirección',
  ciudad: 'Ciudad',
  telefono: 'Teléfono',
  email: 'Correo de contacto',
  sitioWeb: 'Sitio web',
};

/** Pestaña General. Solo ADMIN edita; los demás roles la ven en modo lectura. */
export function FormGeneral({
  config,
  editable,
}: {
  config: ConfiguracionIglesia;
  editable: boolean;
}) {
  const actualizar = useActualizarConfiguracion();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DatosConfiguracion>({ resolver: zodResolver(esquemaConfiguracion) });

  useEffect(() => {
    reset({
      nombre: config.nombre,
      direccion: config.direccion ?? '',
      ciudad: config.ciudad ?? '',
      telefono: config.telefono ?? '',
      email: config.email ?? '',
      sitioWeb: config.sitioWeb ?? '',
      moneda: config.moneda as DatosConfiguracion['moneda'],
      zonaHoraria: config.zonaHoraria as DatosConfiguracion['zonaHoraria'],
    });
  }, [config, reset]);

  const enviar = handleSubmit(async (datos) => {
    try {
      await actualizar.mutateAsync(esquemaConfiguracion.parse(datos));
      notificar.exito('Configuración guardada');
    } catch (error) {
      const campo = (['nombre', ...CAMPOS_TEXTO, 'moneda', 'zonaHoraria'] as const).find((c) =>
        errorDeCampo(error, c),
      );
      if (campo) setError(campo, { message: errorDeCampo(error, campo) });
      else notificar.error(error);
    }
  });

  return (
    <form onSubmit={enviar} noValidate className="flex max-w-3xl flex-col gap-4">
      <fieldset disabled={!editable} className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">Datos de la iglesia</legend>
        <FormField
          label="Nombre de la iglesia"
          requerido
          error={errors.nombre?.message}
          className="sm:col-span-2"
        >
          <Input {...register('nombre')} />
        </FormField>
        {CAMPOS_TEXTO.map((campo) => (
          <FormField key={campo} label={ETIQUETAS[campo]} error={errors[campo]?.message}>
            <Input
              type={campo === 'email' ? 'email' : campo === 'sitioWeb' ? 'url' : 'text'}
              {...register(campo)}
            />
          </FormField>
        ))}
        <Controller
          control={control}
          name="moneda"
          render={({ field }) => (
            <FormField label="Moneda" requerido error={errors.moneda?.message}>
              <SelectEnum
                opciones={opcionesDe(MONEDAS)}
                valor={field.value}
                alCambiar={field.onChange}
                disabled={!editable}
              />
            </FormField>
          )}
        />
        <Controller
          control={control}
          name="zonaHoraria"
          render={({ field }) => (
            <FormField label="Zona horaria" requerido error={errors.zonaHoraria?.message}>
              <SelectEnum
                opciones={opcionesDe(ZONAS_HORARIAS)}
                valor={field.value}
                alCambiar={field.onChange}
                disabled={!editable}
              />
            </FormField>
          )}
        />
      </fieldset>
      {editable && (
        <Button type="submit" disabled={isSubmitting || !isDirty} className="self-start">
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
          Guardar cambios
        </Button>
      )}
    </form>
  );
}
