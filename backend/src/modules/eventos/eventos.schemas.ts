import { z } from 'zod';
import { esquemaPaginacion } from '../../lib/paginacion';

export const TIPOS_EVENTO = ['RELIGIOSO', 'ADMINISTRATIVO'] as const;
export const CATEGORIAS_EVENTO = ['CULTO', 'REUNION', 'ACTIVIDAD', 'OTRO'] as const;
export const ESTADOS_EVENTO = ['PROGRAMADO', 'CANCELADO', 'REALIZADO'] as const;

/** Rango máximo del calendario (B3-02). */
export const MAX_DIAS_RANGO = 93;
export const MAX_EVENTOS_RANGO = 500;
export const MAX_RESPONSABLES = 10;

const texto = (max: number) => z.string().trim().max(max);

// Opcionales: cadena vacía o null se guardan como null
const opcional = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((v) => (v === '' ? null : v), esquema.nullable().optional());

const fechaHora = z.iso
  .datetime({ offset: true, message: 'Fecha y hora no válidas (ISO 8601).' })
  .transform((v) => new Date(v));

/**
 * Fecha ("yyyy-MM-dd") o fecha y hora ISO. Una fecha sola se interpreta en la zona horaria de la
 * iglesia en el service (desde = inicio de ese día, hasta = fin de ese día).
 */
const instante = z.union([z.iso.datetime({ offset: true }), z.iso.date()], {
  error: 'Fecha no válida (yyyy-MM-dd o ISO 8601).',
});

/** Aproximación en milisegundos para validar el rango (±1 día de zona horaria no cambia el resultado). */
const ms = (v: string) => Date.parse(v.length === 10 ? `${v}T00:00:00.000Z` : v);

const camposEvento = {
  titulo: texto(150).min(1, 'Escribe el título.'),
  descripcion: opcional(texto(2000)),
  tipo: z.enum(TIPOS_EVENTO, { error: 'Tipo de evento no válido.' }),
  categoria: z.enum(CATEGORIAS_EVENTO, { error: 'Categoría no válida.' }),
  fechaInicio: fechaHora,
  fechaFin: opcional(fechaHora),
  lugar: texto(150).min(1, 'Escribe el lugar.'),
  ministerioId: opcional(z.uuid('Identificador de ministerio no válido.')),
};

const MENSAJE_FECHAS = 'La fecha de fin debe ser igual o posterior a la de inicio.';

/** fechaFin ≥ fechaInicio cuando vienen las dos (el PATCH lo vuelve a revisar contra lo guardado). */
function finNoAnterior(d: { fechaInicio?: Date; fechaFin?: Date | null }) {
  return !d.fechaInicio || !d.fechaFin || d.fechaFin >= d.fechaInicio;
}

export const esquemaIdEvento = z.object({ id: z.uuid('Identificador no válido.') });

export const esquemaCrearEvento = z
  .strictObject(camposEvento)
  .refine(finNoAnterior, { message: MENSAJE_FECHAS, path: ['fechaFin'] });

export const esquemaEditarEvento = z
  .strictObject({
    ...camposEvento,
    titulo: camposEvento.titulo.optional(),
    tipo: camposEvento.tipo.optional(),
    categoria: camposEvento.categoria.optional(),
    fechaInicio: camposEvento.fechaInicio.optional(),
    lugar: camposEvento.lugar.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, 'No hay cambios para guardar.')
  .refine(finNoAnterior, { message: MENSAJE_FECHAS, path: ['fechaFin'] });

export const esquemaCancelarEvento = z.strictObject({
  motivo: z
    .string()
    .trim()
    .min(5, 'El motivo debe tener al menos 5 caracteres.')
    .max(300, 'El motivo no puede pasar de 300 caracteres.'),
});

export const esquemaResponsables = z.strictObject({
  miembroIds: z
    .array(z.uuid('Identificador de miembro no válido.'))
    .transform((ids) => [...new Set(ids)])
    .refine((ids) => ids.length <= MAX_RESPONSABLES, {
      message: `Máximo ${MAX_RESPONSABLES} responsables.`,
    }),
});

export const esquemaListarEventos = esquemaPaginacion
  .extend({
    desde: instante.optional(),
    hasta: instante.optional(),
    tipo: z.enum(TIPOS_EVENTO).optional(),
    categoria: z.enum(CATEGORIAS_EVENTO).optional(),
    estado: z.enum(ESTADOS_EVENTO).optional(),
    ministerioId: z.uuid('Identificador de ministerio no válido.').optional(),
  })
  .refine((q) => !q.desde || !q.hasta || ms(q.hasta) >= ms(q.desde), {
    message: '"hasta" debe ser posterior a "desde".',
    path: ['hasta'],
  })
  .refine(
    (q) =>
      !q.desde || !q.hasta || ms(q.hasta) - ms(q.desde) <= MAX_DIAS_RANGO * 24 * 60 * 60 * 1000,
    { message: `El rango no puede pasar de ${MAX_DIAS_RANGO} días.`, path: ['hasta'] },
  );

export const esquemaProximos = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export type QueryEventos = z.infer<typeof esquemaListarEventos>;
export type CrearEvento = z.infer<typeof esquemaCrearEvento>;
export type EditarEvento = z.infer<typeof esquemaEditarEvento>;
