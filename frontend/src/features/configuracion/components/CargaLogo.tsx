import { Church, ImageUp, Loader2 } from 'lucide-react';
import { type DragEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/card';
import { notificar } from '@/lib/notificar';
import { cn } from '@/lib/utils';
import type { ConfiguracionIglesia } from '@/types/configuracion';
import { TIPOS_LOGO } from '../catalogos';
import { useSubirLogo } from '../hooks';
import { validarLogo } from '../schemas';

/** Pestaña Logotipo: arrastrar/soltar con vista previa, validación previa y barra de progreso. */
export function CargaLogo({
  config,
  editable,
}: {
  config: ConfiguracionIglesia;
  editable: boolean;
}) {
  const subir = useSubirLogo();
  const entrada = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  function elegir(nuevo: File | undefined) {
    if (!nuevo) return;
    const mensaje = validarLogo(nuevo);
    setError(mensaje);
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    if (mensaje) {
      setArchivo(null);
      setVistaPrevia(null);
      return;
    }
    setArchivo(nuevo);
    setVistaPrevia(URL.createObjectURL(nuevo));
  }

  function alSoltar(e: DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    if (editable) elegir(e.dataTransfer.files[0]);
  }

  async function enviar() {
    if (!archivo) return;
    setProgreso(0);
    try {
      await subir.mutateAsync({ archivo, alProgresar: setProgreso });
      notificar.exito('Logotipo actualizado');
      setArchivo(null);
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
      setVistaPrevia(null);
    } catch (e) {
      notificar.error(e);
    }
  }

  const imagen = vistaPrevia ?? config.logoUrl;

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-superficie-suave">
          {imagen ? (
            <img src={imagen} alt="Logotipo de la iglesia" className="size-full object-contain" />
          ) : (
            <Church className="size-10 text-texto-suave" aria-hidden />
          )}
        </div>
        <p className="text-texto-suave">
          {vistaPrevia ? 'Vista previa del logotipo nuevo.' : 'Logotipo actual.'}
        </p>
      </div>

      {editable && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={alSoltar}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              arrastrando && 'border-primario bg-superficie-suave',
            )}
          >
            <ImageUp className="size-8 text-texto-suave" aria-hidden />
            <p>Arrastra una imagen aquí o</p>
            <Button type="button" variante="contorno" onClick={() => entrada.current?.click()}>
              Elegir archivo
            </Button>
            <p className="text-xs text-texto-suave">PNG, JPG, WEBP o SVG. Máximo 2 MB.</p>
            <input
              ref={entrada}
              type="file"
              accept={TIPOS_LOGO.join(',')}
              className="sr-only"
              aria-label="Archivo del logotipo"
              onChange={(e) => {
                elegir(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>

          {error && <Alert variante="peligro">{error}</Alert>}

          {subir.isPending && (
            <div
              role="progressbar"
              aria-label="Progreso de subida"
              aria-valuenow={progreso}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-superficie-suave"
            >
              <div
                className="h-full bg-primario transition-all"
                style={{ width: `${progreso}%` }}
              />
            </div>
          )}

          {archivo && (
            <Button onClick={enviar} disabled={subir.isPending} className="self-start">
              {subir.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Subir logotipo
            </Button>
          )}
        </>
      )}
    </div>
  );
}
