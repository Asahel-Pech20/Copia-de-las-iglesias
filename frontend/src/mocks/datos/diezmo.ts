import type { Padre } from '@/app/tipos/diezmo';
import { IGLESIA_MOCK, OTRA_IGLESIA_MOCK } from './b1';

// Datos simulados del diezmo (Ecclesia). Las misas se calculan respecto a hoy (nunca futuras) para
// que los filtros por mes tengan datos sin importar el día en que se ejecute.

export interface MisaMock {
  id: string;
  iglesiaId: string;
  /** Instante de inicio (ISO, UTC) */
  inicio: string;
  padreId: string;
}

export interface DiezmoMock {
  id: string;
  misaId: string;
  iglesiaId: string;
  monto: string;
  capturadoPorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CorreccionMock {
  id: string;
  diezmoId: string;
  montoAnterior: string;
  montoNuevo: string;
  hechaPorId: string;
  hechaEn: string;
}

const DIA = 24 * 60 * 60 * 1000;
/** Mismo instante que `dias` atrás, a las 16:00 UTC (10:00 en la Ciudad de México) */
function haceDias(dias: number, horaUtc = 16) {
  const d = new Date(Date.now() - dias * DIA);
  d.setUTCHours(horaUtc, 0, 0, 0);
  return d.toISOString();
}

export const padresIniciales = (): Padre[] => [
  { id: 'pa-luis', nombre: 'Luis Pérez Cámara' },
  { id: 'pa-ana', nombre: 'Ramón Cauich Dzul' },
];

export const misasIniciales = (): MisaMock[] => [
  { id: 'mi-1', iglesiaId: IGLESIA_MOCK, inicio: haceDias(1, 16), padreId: 'pa-luis' },
  { id: 'mi-2', iglesiaId: IGLESIA_MOCK, inicio: haceDias(1, 0), padreId: 'pa-ana' },
  { id: 'mi-3', iglesiaId: IGLESIA_MOCK, inicio: haceDias(3, 16), padreId: 'pa-luis' },
  { id: 'mi-4', iglesiaId: IGLESIA_MOCK, inicio: haceDias(8, 16), padreId: 'pa-ana' },
  { id: 'mi-5', iglesiaId: IGLESIA_MOCK, inicio: haceDias(40, 16), padreId: 'pa-luis' },
  { id: 'mi-otra', iglesiaId: OTRA_IGLESIA_MOCK, inicio: haceDias(1, 16), padreId: 'pa-luis' },
];

const fecha = new Date().toISOString();

export const diezmosIniciales = (): DiezmoMock[] => [
  {
    id: 'di-1',
    misaId: 'mi-1',
    iglesiaId: IGLESIA_MOCK,
    monto: '1250.50',
    capturadoPorId: 'u-tesorero',
    createdAt: fecha,
    updatedAt: fecha,
  },
  {
    id: 'di-3',
    misaId: 'mi-3',
    iglesiaId: IGLESIA_MOCK,
    monto: '800.00',
    capturadoPorId: 'u-tesorero',
    createdAt: fecha,
    updatedAt: fecha,
  },
  {
    id: 'di-4',
    misaId: 'mi-4',
    iglesiaId: IGLESIA_MOCK,
    monto: '2000.00',
    capturadoPorId: 'u-tesorero',
    createdAt: fecha,
    updatedAt: fecha,
  },
  {
    id: 'di-5',
    misaId: 'mi-5',
    iglesiaId: IGLESIA_MOCK,
    monto: '500.00',
    capturadoPorId: 'u-tesorero',
    createdAt: fecha,
    updatedAt: fecha,
  },
  {
    id: 'di-otra',
    misaId: 'mi-otra',
    iglesiaId: OTRA_IGLESIA_MOCK,
    monto: '99999.00',
    capturadoPorId: 'u-tesorero2',
    createdAt: fecha,
    updatedAt: fecha,
  },
];

/** La misa 3 tiene una corrección: 700.00 → 800.00 */
export const correccionesIniciales = (): CorreccionMock[] => [
  {
    id: 'co-1',
    diezmoId: 'di-3',
    montoAnterior: '700.00',
    montoNuevo: '800.00',
    hechaPorId: 'u-tesorero',
    hechaEn: fecha,
  },
];
