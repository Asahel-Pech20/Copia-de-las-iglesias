// PLANTILLA — copia esta carpeta como modules/<modulo>/ y renombra "_plantilla".
// Esquemas Zod de body, query y params. Usa z.strictObject en creación/edición (rechaza campos desconocidos).
import { z } from 'zod';
import { esquemaPaginacion } from '../../lib/paginacion';

export const esquemaListar = esquemaPaginacion.extend({
  activo: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export const esquemaId = z.object({ id: z.uuid('Identificador no válido.') });

export type QueryListar = z.infer<typeof esquemaListar>;
