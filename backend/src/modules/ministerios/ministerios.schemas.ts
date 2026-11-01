import { z } from 'zod';
import { esquemaPaginacion } from '../../lib/paginacion';

const booleanoQuery = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')
  .optional();

const nombre = z.string().trim().min(1, 'Escribe el nombre.').max(80);
const descripcion = z.preprocess(
  (v) => (v === '' ? null : v),
  z.string().trim().max(500).nullable().optional(),
);

// Lista de ids sin repetidos (los repetidos se ignoran)
const listaIds = (mensaje: string) =>
  z
    .array(z.uuid(mensaje))
    .max(500)
    .transform((ids) => [...new Set(ids)]);

export const esquemaIdMinisterio = z.object({ id: z.uuid('Identificador no válido.') });
export const esquemaIdVinculo = z.object({
  id: z.uuid('Identificador no válido.'),
  miembroId: z.uuid('Identificador de miembro no válido.'),
});

export const esquemaListarMinisterios = esquemaPaginacion.extend({ activo: booleanoQuery });

export const esquemaCrearMinisterio = z.strictObject({ nombre, descripcion });

export const esquemaEditarMinisterio = z
  .strictObject({ nombre: nombre.optional(), descripcion })
  .refine((d) => Object.keys(d).length > 0, 'No hay cambios para guardar.');

export const esquemaEstadoMinisterio = z.strictObject({ activo: z.boolean() });

export const esquemaCoordinadores = z.strictObject({
  usuarioIds: listaIds('Identificador de usuario no válido.'),
});

export const esquemaVincularMiembros = z.strictObject({
  miembroIds: listaIds('Identificador de miembro no válido.').refine(
    (ids) => ids.length > 0,
    'Selecciona al menos un miembro.',
  ),
});

export const esquemaListarIntegrantes = esquemaPaginacion.extend({
  incluirHistoricos: booleanoQuery,
});

export type QueryMinisterios = z.infer<typeof esquemaListarMinisterios>;
export type QueryIntegrantes = z.infer<typeof esquemaListarIntegrantes>;
export type CrearMinisterio = z.infer<typeof esquemaCrearMinisterio>;
export type EditarMinisterio = z.infer<typeof esquemaEditarMinisterio>;
