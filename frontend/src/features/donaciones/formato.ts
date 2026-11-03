import { ETIQUETAS_CONCEPTO } from '@/lib/formato';
import type { Donacion } from '@/types/donaciones';

export const nombreDonante = (d: Pick<Donacion, 'miembro'>) =>
  d.miembro ? `${d.miembro.nombre} ${d.miembro.apellidos}` : 'Anónimo';

/** "Diezmo", o "Otro: Fondo pro-templo" cuando el concepto es OTRO con detalle. */
export const conceptoDe = (d: Pick<Donacion, 'concepto' | 'conceptoDetalle'>) =>
  d.concepto === 'OTRO' && d.conceptoDetalle
    ? `Otro: ${d.conceptoDetalle}`
    : ETIQUETAS_CONCEPTO[d.concepto];

/** "+20,0 %" / "−5,3 %" */
export function textoVariacion(valor: number) {
  const numero = Math.abs(valor).toLocaleString('es-MX', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${valor > 0 ? '+' : valor < 0 ? '−' : ''}${numero} %`;
}
