import { z } from 'zod';
import type { GuardarAnuncio } from '@/types/anuncios';

// Espejo de backend/src/modules/anuncios/anuncios.schemas.ts.
// Las fechas se capturan con <input type="datetime-local"> (hora local) y se envían en ISO.

export const SIN_EVENTO = 'ninguno';

const fechaLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Fecha y hora no válidas.');

export const esquemaAnuncio = z
  .object({
    titulo: z.string().trim().min(1, 'Escribe el título.').max(120, 'Máximo 120 caracteres.'),
    contenido: z
      .string()
      .trim()
      .min(1, 'Escribe el contenido.')
      .max(5000, 'Máximo 5 000 caracteres.'),
    prioridad: z.enum(['NORMAL', 'IMPORTANTE']),
    fechaPublicacion: fechaLocal,
    fechaExpiracion: z.union([z.literal(''), fechaLocal]),
    eventoId: z.string(),
  })
  .refine((d) => !d.fechaExpiracion || d.fechaExpiracion > d.fechaPublicacion, {
    message: 'La expiración debe ser posterior a la publicación.',
    path: ['fechaExpiracion'],
  })
  .transform((d): GuardarAnuncio => ({
    titulo: d.titulo,
    contenido: d.contenido,
    prioridad: d.prioridad,
    fechaPublicacion: new Date(d.fechaPublicacion).toISOString(),
    fechaExpiracion: d.fechaExpiracion ? new Date(d.fechaExpiracion).toISOString() : null,
    eventoId: d.eventoId === SIN_EVENTO ? null : d.eventoId,
  }));

export type FormAnuncio = z.input<typeof esquemaAnuncio>;
