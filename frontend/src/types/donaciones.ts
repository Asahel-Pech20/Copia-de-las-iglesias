import type { MetaPaginacion, QueryLista } from './comunes';

// Espejo de backend/src/modules/donaciones (specs.md §6–§7, B4). Los montos viajan como string ("1500.00").

export type ConceptoDonacion = 'DIEZMO' | 'OFRENDA' | 'PRIMICIA' | 'DONACION_ESPECIAL' | 'OTRO';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'CHEQUE' | 'OTRO';
export type AgrupacionIngresos = 'dia' | 'semana' | 'mes' | 'concepto' | 'metodo';

/** GET /donaciones y GET /donaciones/:id */
export interface Donacion {
  id: string;
  /** "yyyy-MM-dd" */
  fecha: string;
  monto: string;
  concepto: ConceptoDonacion;
  conceptoDetalle: string | null;
  metodo: MetodoPago;
  anonima: boolean;
  referencia: string | null;
  notas: string | null;
  anulada: boolean;
  motivoAnulacion: string | null;
  anuladaEn: string | null;
  createdAt: string;
  updatedAt: string;
  /** null cuando la aportación es anónima */
  miembro: { id: string; nombre: string; apellidos: string } | null;
  registradoPor: { id: string; nombre: string };
  /** Última persona que editó o anuló */
  actualizadoPor: { id: string; nombre: string } | null;
}

export interface MetaDonaciones extends MetaPaginacion {
  /** Suma del filtro completo, sin anuladas */
  totalMonto: string;
}

export interface RespuestaListaDonaciones {
  data: Donacion[];
  meta: MetaDonaciones;
}

export interface QueryDonaciones extends QueryLista {
  /** "yyyy-MM-dd" */
  desde?: string;
  hasta?: string;
  concepto?: ConceptoDonacion;
  metodo?: MetodoPago;
  miembroId?: string;
  anonima?: boolean;
  incluirAnuladas?: boolean;
}

export interface GuardarDonacion {
  fecha: string;
  monto: string;
  concepto: ConceptoDonacion;
  conceptoDetalle?: string | null;
  metodo: MetodoPago;
  miembroId?: string | null;
  anonima: boolean;
  referencia?: string | null;
  notas?: string | null;
}

/** Elemento de `grupos` en los resúmenes: `clave` es el día, semana ISO, mes, concepto o método */
export interface GrupoIngresos {
  clave: string;
  total: string;
  cantidad: number;
}

/** GET /donaciones/resumen */
export interface ResumenIngresos {
  desde: string;
  hasta: string;
  agrupar: AgrupacionIngresos;
  total: string;
  cantidad: number;
  grupos: GrupoIngresos[];
}

export interface QueryResumenIngresos {
  desde?: string;
  hasta?: string;
  agrupar?: AgrupacionIngresos;
}

/** GET /donaciones/resumen-mensual */
export interface ResumenMensual {
  anio: number;
  mes: number;
  desde: string;
  hasta: string;
  total: string;
  cantidad: number;
  mesAnterior: { anio: number; mes: number; total: string };
  /** null si el mes anterior no tuvo ingresos */
  variacionPorcentual: number | null;
  porConcepto: GrupoIngresos[];
  porMetodo: GrupoIngresos[];
  anonimas: { cantidad: number; total: string };
  identificadas: { cantidad: number; total: string };
}
