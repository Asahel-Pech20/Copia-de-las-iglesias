import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useBlocker, useNavigate, useParams } from 'react-router';
import { CampoFecha } from '@/components/comunes/CamposFormulario';
import { ConfirmDialog } from '@/components/comunes/ConfirmDialog';
import { ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { FormField } from '@/components/comunes/FormField';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Button } from '@/components/ui/button';
import { Alert, Card, CardContent } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { errorDeCampo, esErrorApi, normalizarError } from '@/lib/api';
import { aFechaApi } from '@/lib/formato';
import { notificar } from '@/lib/notificar';
import type { MiembroDetalle } from '@/types/miembros';
import { useCrearMiembro, useEditarMiembro, useMiembro } from '../hooks';
import { type DatosMiembro, esquemaMiembro, type FormMiembro } from '../schemas';

const CAMPOS: (keyof FormMiembro)[] = [
  'nombre',
  'apellidos',
  'fechaIngreso',
  'telefono',
  'email',
  'fechaNacimiento',
  'direccion',
  'notas',
];

function valoresIniciales(miembro?: MiembroDetalle): FormMiembro {
  return {
    nombre: miembro?.nombre ?? '',
    apellidos: miembro?.apellidos ?? '',
    fechaIngreso: miembro?.fechaIngreso ?? aFechaApi(new Date()),
    telefono: miembro?.telefono ?? '',
    email: miembro?.email ?? '',
    fechaNacimiento: miembro?.fechaNacimiento ?? null,
    direccion: miembro?.direccion ?? '',
    notas: miembro?.notas ?? '',
  };
}

/** Estado de navegación que recibe el perfil tras crear un posible duplicado */
export interface EstadoPerfilMiembro {
  duplicadoId?: string;
}

/** /miembros/nuevo y /miembros/:id/editar (F2-02). */
export function MiembroFormPage() {
  const { id } = useParams();
  const consulta = useMiembro(id);

  if (id && consulta.isPending) {
    return (
      <>
        <PageHeader titulo="Editar miembro" />
        <Card>
          <SkeletonTabla filas={4} columnas={2} />
        </Card>
      </>
    );
  }
  if (id && consulta.isError) {
    return (
      <>
        <PageHeader titulo="Editar miembro" />
        <Card>
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        </Card>
      </>
    );
  }
  return <FormularioMiembro key={id ?? 'nuevo'} miembro={consulta.data} />;
}

function FormularioMiembro({ miembro }: { miembro?: MiembroDetalle }) {
  const navegar = useNavigate();
  const crear = useCrearMiembro();
  const editar = useEditarMiembro();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  // true tras guardar o al confirmar "salir sin guardar": ya no se bloquea la navegación
  const permitirSalida = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormMiembro, unknown, DatosMiembro>({
    resolver: zodResolver(esquemaMiembro),
    defaultValues: valoresIniciales(miembro),
  });

  // Salir con cambios sin guardar pide confirmación (dentro de la app y al cerrar la pestaña)
  const bloqueo = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !permitirSalida.current && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (!isDirty) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [isDirty]);

  const enviar = handleSubmit(async (datos) => {
    setErrorServidor(null);
    try {
      let destino: string;
      let estado: EstadoPerfilMiembro = {};
      if (miembro) {
        await editar.mutateAsync({ id: miembro.id, datos });
        destino = miembro.id;
      } else {
        const res = await crear.mutateAsync(datos);
        destino = res.data.id;
        if (res.meta?.posibleDuplicado) estado = { duplicadoId: res.meta.duplicadoId };
      }
      notificar.exito('Miembro guardado');
      permitirSalida.current = true;
      navegar(`/miembros/${destino}`, { state: estado });
    } catch (error) {
      // Errores de campo del backend (400) van a su campo; el resto, arriba del formulario
      const conCampo =
        esErrorApi(error) &&
        CAMPOS.filter((campo) => {
          const mensaje = errorDeCampo(error, campo);
          if (mensaje) setError(campo, { message: mensaje });
          return Boolean(mensaje);
        }).length > 0;
      if (!conCampo) setErrorServidor(normalizarError(error).message);
    }
  });

  const titulo = miembro ? 'Editar miembro' : 'Nuevo miembro';
  const volver = miembro ? `/miembros/${miembro.id}` : '/miembros';

  return (
    <>
      <PageHeader
        titulo={titulo}
        descripcion={miembro ? `${miembro.nombre} ${miembro.apellidos}` : undefined}
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
            <FormField label="Nombre" requerido error={errors.nombre?.message}>
              <Input autoComplete="off" {...register('nombre')} />
            </FormField>
            <FormField label="Apellidos" requerido error={errors.apellidos?.message}>
              <Input autoComplete="off" {...register('apellidos')} />
            </FormField>
            <FormField
              label="Teléfono"
              error={errors.telefono?.message}
              hint="De 7 a 15 dígitos. Puedes usar +, espacios y guiones."
            >
              <Input type="tel" autoComplete="off" {...register('telefono')} />
            </FormField>
            <FormField label="Correo" error={errors.email?.message}>
              <Input type="email" autoComplete="off" {...register('email')} />
            </FormField>
            <Controller
              control={control}
              name="fechaIngreso"
              render={({ field }) => (
                <FormField label="Fecha de ingreso" requerido error={errors.fechaIngreso?.message}>
                  <CampoFecha valor={field.value} alCambiar={(v) => field.onChange(v ?? '')} />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="fechaNacimiento"
              render={({ field }) => (
                <FormField label="Fecha de nacimiento" error={errors.fechaNacimiento?.message}>
                  <CampoFecha valor={field.value} alCambiar={field.onChange} />
                </FormField>
              )}
            />
            <FormField
              label="Dirección"
              error={errors.direccion?.message}
              className="sm:col-span-2"
            >
              <Input autoComplete="off" {...register('direccion')} />
            </FormField>
            <FormField label="Notas" error={errors.notas?.message} className="sm:col-span-2">
              <Textarea {...register('notas')} />
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

      <ConfirmDialog
        abierto={bloqueo.state === 'blocked'}
        // Cancelar = quedarse; confirmar = continuar la navegación (sin reset después de proceed)
        alCambiarAbierto={(abierto) => {
          if (!abierto && !permitirSalida.current) bloqueo.reset?.();
        }}
        titulo="¿Salir sin guardar?"
        descripcion="Tienes cambios sin guardar en este formulario. Si sales, se perderán."
        textoConfirmar="Salir sin guardar"
        peligro
        alConfirmar={() => {
          permitirSalida.current = true;
          bloqueo.proceed?.();
        }}
      />
    </>
  );
}
