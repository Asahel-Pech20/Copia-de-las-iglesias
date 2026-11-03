import { z } from 'zod';
import { esquemaPaginacion } from '../../lib/paginacion';

export const CONCEPTOS = ['DIEZMO', 'OFRENDA', 'PRIMICIA', 'DONACION_ESPECIAL', 'OTRO'] as const;
export const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO'] as const;
export const AGRUPACIONES = ['dia', 'semana', 'mes', 'concepto', 'metodo'] as const;

/** Decimal(12,2): hasta 10 enteros y 2 decimales. */
export const MONTO_MAXIMO = '9999999999.99';
/** Rango máximo de los resúmenes (B4-05). */
export const MAX_DIAS_RESUMEN = 731;

const DIA_MS = 86_400_000;

const fecha = z.iso.date('Fecha no válida (formato yyyy-MM-dd).');

// Opcionales: cadena vacía o null se guardan como null
const opcional = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((v) => (v === '' ? null : v), esquema.nullable().optional());

/**
 * Monto como string decimal ("1500.00"). Se acepta un number en el JSON, pero se trabaja como
 * texto para no perder precisión (AGENTS.md §3: nunca sumar dinero con number).
 */
const monto = z
  .union([z.string(), z.number()], { error: 'Escribe el monto.' })
  .transform((v) => (typeof v === 'number' ? String(v) : v.trim()))
  .refine((v) => /^\d{1,10}(\.\d{1,2})?$/.test(v), {
    message: 'Monto no válido: usa hasta 10 enteros y 2 decimales (ej. 1500.00).',
  })
  .refine((v) => Number(v) > 0, { message: 'El monto debe ser mayor que cero.' });

const texto = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max.toLocaleString('es-MX')} caracteres.`);

const camposDonacion = {
  fecha,
  monto,
  concepto: z.enum(CONCEPTOS, { error: 'Concepto no válido.' }),
  conceptoDetalle: opcional(texto(150)),
  metodo: z.enum(METODOS, { error: 'Método de recepción no válido.' }),
  miembroId: opcional(z.uuid('Identificador de miembro no válido.')),
  anonima: z.boolean({ error: 'Indica si la aportación es anónima.' }),
  referencia: opcional(texto(100)),
  notas: opcional(texto(1000)),
};

const MENSAJE_ANONIMA = 'Una aportación anónima no puede tener donante.';
const MENSAJE_DETALLE = 'Describe el concepto cuando es "Otro".';

const sinDonanteSiAnonima = (d: { anonima?: boolean; miembroId?: string | null }) =>
  !(d.anonima === true && d.miembroId);

export const esquemaIdDonacion = z.object({ id: z.uuid('Identificador no válido.') });

export const esquemaCrearDonacion = z
  .strictObject({ ...camposDonacion, anonima: camposDonacion.anonima.default(false) })
  .refine(sinDonanteSiAnonima, { message: MENSAJE_ANONIMA, path: ['miembroId'] })
  .refine((d) => d.concepto !== 'OTRO' || !!d.conceptoDetalle, {
    message: MENSAJE_DETALLE,
    path: ['conceptoDetalle'],
  });

// En la edición la regla de "Otro" se revisa en el service contra lo guardado
export const esquemaEditarDonacion = z
  .strictObject({
    ...camposDonacion,
    fecha: fecha.optional(),
    monto: monto.optional(),
    concepto: camposDonacion.concepto.optional(),
    metodo: camposDonacion.metodo.optional(),
    anonima: camposDonacion.anonima.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, 'No hay cambios para guardar.')
  .refine(sinDonanteSiAnonima, { message: MENSAJE_ANONIMA, path: ['miembroId'] });

export const esquemaAnularDonacion = z.strictObject({
  motivo: z
    .string()
    .trim()
    .min(5, 'El motivo debe tener al menos 5 caracteres.')
    .max(300, 'El motivo no puede pasar de 300 caracteres.'),
});

const booleanoQuery = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')
  .optional();

const desdeAntesDeHasta = (q: { desde?: string; hasta?: string }) =>
  !q.desde || !q.hasta || q.hasta >= q.desde;

const rangoPermitido = (q: { desde?: string; hasta?: string }) =>
  !q.desde || !q.hasta || Date.parse(q.hasta) - Date.parse(q.desde) <= MAX_DIAS_RESUMEN * DIA_MS;

const MENSAJE_ORDEN = '"hasta" debe ser igual o posterior a "desde".';
const MENSAJE_RANGO = 'El rango no puede pasar de 2 años.';

export const esquemaListarDonaciones = esquemaPaginacion
  .extend({
    desde: fecha.optional(),
    hasta: fecha.optional(),
    concepto: z.enum(CONCEPTOS).optional(),
    metodo: z.enum(METODOS).optional(),
    miembroId: z.uuid('Identificador de miembro no válido.').optional(),
    anonima: booleanoQuery,
    incluirAnuladas: booleanoQuery,
  })
  .refine(desdeAntesDeHasta, { message: MENSAJE_ORDEN, path: ['hasta'] });

export const esquemaResumen = z
  .object({
    desde: fecha.optional(),
    hasta: fecha.optional(),
    agrupar: z.enum(AGRUPACIONES, { error: 'Agrupación no válida.' }).default('mes'),
  })
  .refine(desdeAntesDeHasta, { message: MENSAJE_ORDEN, path: ['hasta'] })
  .refine(rangoPermitido, { message: MENSAJE_RANGO, path: ['hasta'] });

export const esquemaResumenMensual = z.object({
  anio: z.coerce.number().int().min(2000).max(2100).optional(),
  mes: z.coerce.number().int().min(1).max(12).optional(),
});

export type Concepto = (typeof CONCEPTOS)[number];
export type Metodo = (typeof METODOS)[number];
export type Agrupacion = (typeof AGRUPACIONES)[number];
export type QueryDonaciones = z.infer<typeof esquemaListarDonaciones>;
export type QueryResumen = z.infer<typeof esquemaResumen>;
export type QueryResumenMensual = z.infer<typeof esquemaResumenMensual>;
export type CrearDonacion = z.infer<typeof esquemaCrearDonacion>;
export type EditarDonacion = z.infer<typeof esquemaEditarDonacion>;
