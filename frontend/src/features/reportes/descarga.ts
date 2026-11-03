import type { ArchivoDescargado } from '@/types/reportes';

/** Dispara la descarga del archivo en el navegador (enlace temporal con la URL del Blob). */
export function guardarArchivo({ blob, nombre }: ArchivoDescargado) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  // El navegador necesita un momento para iniciar la descarga antes de liberar la URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
