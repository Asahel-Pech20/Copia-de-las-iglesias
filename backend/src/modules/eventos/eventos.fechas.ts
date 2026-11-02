/**
 * Fechas "yyyy-MM-dd" ↔ instantes UTC en la zona horaria de la iglesia (B3).
 * Un día empieza a las 00:00 locales de la iglesia, no a las 00:00 UTC: en México un evento
 * a las 19:00 sigue siendo de "hoy" aunque en UTC ya sea mañana (criterio de la revisión del PR #3).
 */
import * as configuracionService from '../configuracion/configuracion.service';

const DIA_MS = 86_400_000;

/** Milisegundos que la zona va adelantada respecto de UTC en ese instante (negativo en América). */
function desfase(instante: Date, zonaHoraria: string) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zonaHoraria,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(instante)
      .map((p) => [p.type, Number(p.value)]),
  );
  const pared = Date.UTC(
    partes.year!,
    partes.month! - 1,
    partes.day!,
    partes.hour!,
    partes.minute!,
    partes.second!,
  );
  return pared - Math.floor(instante.getTime() / 1000) * 1000;
}

/** Instante UTC en que empieza el día "yyyy-MM-dd" en la zona horaria indicada. */
export function inicioDiaEnZona(fecha: string, zonaHoraria: string) {
  const base = new Date(`${fecha}T00:00:00.000Z`);
  const aprox = new Date(base.getTime() - desfase(base, zonaHoraria));
  // Segunda pasada por si el desfase cambia ese día (horario de verano)
  return new Date(base.getTime() - desfase(aprox, zonaHoraria));
}

/** Instante UTC en que empieza el día siguiente (límite exclusivo del día). */
export function finDiaEnZona(fecha: string, zonaHoraria: string) {
  const siguiente = new Date(new Date(`${fecha}T00:00:00.000Z`).getTime() + DIA_MS);
  return inicioDiaEnZona(siguiente.toISOString().slice(0, 10), zonaHoraria);
}

/** "yyyy-MM-dd" de un instante en la zona horaria indicada. */
export function fechaEnZona(instante: Date, zonaHoraria: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zonaHoraria }).format(instante);
}

/** Zona horaria configurada de la iglesia (RF-10). */
export async function zonaIglesia() {
  return (await configuracionService.obtener()).zonaHoraria;
}

export const esFechaSola = (valor: string) => /^\d{4}-\d{2}-\d{2}$/.test(valor);
