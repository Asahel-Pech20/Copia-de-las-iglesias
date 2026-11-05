import { format } from 'date-fns';
import type { ConceptoDonacion, MetodoPago } from '@/app/tipos/donaciones';

// Datos simulados de donaciones (F4). Las fechas se calculan por mes (nunca futuras) para que
// "este mes" y "mes anterior" tengan datos sin importar el día en que se ejecute.

export interface DonacionMock {
  id: string;
  fecha: string;
  /** Siempre con 2 decimales ("1500.00") */
  monto: string;
  concepto: ConceptoDonacion;
  conceptoDetalle: string | null;
  metodo: MetodoPago;
  miembroId: string | null;
  anonima: boolean;
  referencia: string | null;
  notas: string | null;
  anulada: boolean;
  motivoAnulacion: string | null;
  anuladaEn: string | null;
  registradoPorId: string;
  actualizadoPorId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** "yyyy-MM-dd" del día `dia` del mes que queda `mesesAtras` meses atrás (sin pasar de hoy). */
export function fechaDelMes(mesesAtras: number, dia: number) {
  const hoy = new Date();
  const base = new Date(hoy.getFullYear(), hoy.getMonth() - mesesAtras, 1);
  const ultimo = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const tope = mesesAtras === 0 ? Math.min(ultimo, hoy.getDate()) : ultimo;
  return format(new Date(base.getFullYear(), base.getMonth(), Math.min(dia, tope)), 'yyyy-MM-dd');
}

function donacion(
  id: string,
  mesesAtras: number,
  dia: number,
  monto: string,
  concepto: ConceptoDonacion,
  metodo: MetodoPago,
  miembroId: string | null,
  extra: Partial<DonacionMock> = {},
): DonacionMock {
  const fecha = fechaDelMes(mesesAtras, dia);
  return {
    id,
    fecha,
    monto,
    concepto,
    conceptoDetalle: null,
    metodo,
    miembroId,
    anonima: miembroId === null,
    referencia: null,
    notas: null,
    anulada: false,
    motivoAnulacion: null,
    anuladaEn: null,
    registradoPorId: 'u-tesorero',
    actualizadoPorId: null,
    createdAt: `${fecha}T16:00:00.000Z`,
    updatedAt: `${fecha}T16:00:00.000Z`,
    ...extra,
  };
}

/**
 * Este mes (sin anuladas): 4 620.50 · mes anterior: 3 850.00 (variación +20.0 %).
 * Los 10 meses previos tienen una aportación identificada y una anónima.
 */
export const donacionesIniciales = (): DonacionMock[] => [
  donacion('d-1', 0, 1, '1500.00', 'DIEZMO', 'EFECTIVO', 'm-jose'),
  donacion('d-2', 0, 1, '320.50', 'OFRENDA', 'EFECTIVO', null),
  donacion('d-3', 0, 1, '2000.00', 'DIEZMO', 'TRANSFERENCIA', 'm-maria', {
    referencia: 'SPEI-4471',
  }),
  donacion('d-4', 0, 1, '800.00', 'OTRO', 'CHEQUE', 'm-pedro', {
    conceptoDetalle: 'Fondo pro-templo',
    notas: 'Cheque #1032',
  }),
  donacion('d-anulada', 0, 1, '500.00', 'OFRENDA', 'EFECTIVO', 'm-luis', {
    anulada: true,
    motivoAnulacion: 'Captura duplicada',
    anuladaEn: new Date().toISOString(),
    actualizadoPorId: 'u-admin',
  }),
  donacion('d-5', 1, 5, '2000.00', 'DIEZMO', 'TRANSFERENCIA', 'm-ana'),
  donacion('d-6', 1, 12, '1200.00', 'PRIMICIA', 'EFECTIVO', 'm-rosa'),
  donacion('d-7', 1, 19, '650.00', 'OFRENDA', 'EFECTIVO', null),
  ...Array.from({ length: 10 }, (_, i) => i + 2).flatMap((atras) => [
    donacion(
      `d-m${atras}-a`,
      atras,
      8,
      `${1000 + atras * 85}.00`,
      'DIEZMO',
      'TRANSFERENCIA',
      'm-jose',
    ),
    donacion(`d-m${atras}-b`, atras, 15, `${200 + atras * 10}.00`, 'OFRENDA', 'EFECTIVO', null),
  ]),
];
