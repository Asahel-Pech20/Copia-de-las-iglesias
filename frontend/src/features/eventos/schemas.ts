import { z } from 'zod';
import type { GuardarEvento } from '@/types/eventos';

// Espejo de backend/src/modules/eventos/eventos.schemas.ts (fecha + horas locales → ISO)

export const SIN_MINISTERIO = 'ninguno';

const hora = z.string().regex(/^\d{2}:\d{2}$/, 'Hora no válida.');

/** Con `ministerioObligatorio` (COORDINADOR) hay que elegir uno de sus ministerios. */
export function crearEsquemaEvento({ ministerioObligatorio = false } = {}) {
  return z
    .object({
      titulo: z.string().trim().min(1, 'Escribe el título.').max(150),
      tipo: z.enum(['RELIGIOSO', 'ADMINISTRATIVO'], { error: 'Selecciona el tipo.' }),
      categoria: z.enum(['CULTO', 'REUNION', 'ACTIVIDAD', 'OTRO'], {
        error: 'Selecciona la categoría.',
      }),
      fecha: z
        .string({ error: 'Selecciona la fecha.' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona la fecha.'),
      horaInicio: hora,
      horaFin: z.union([z.literal(''), hora]),
      lugar: z.string().trim().min(1, 'Escribe el lugar.').max(150),
      descripcion: z.string().trim().max(2000),
      ministerioId: z.string(),
    })
    .superRefine((d, ctx) => {
      if (d.horaFin && d.horaFin < d.horaInicio) {
        ctx.addIssue({
          code: 'custom',
          path: ['horaFin'],
          message: 'La hora de fin debe ser igual o posterior a la de inicio.',
        });
      }
      if (ministerioObligatorio && (!d.ministerioId || d.ministerioId === SIN_MINISTERIO)) {
        ctx.addIssue({
          code: 'custom',
          path: ['ministerioId'],
          message: 'Elige uno de los ministerios que coordinas.',
        });
      }
    })
    .transform((d): GuardarEvento => ({
      titulo: d.titulo,
      tipo: d.tipo,
      categoria: d.categoria,
      fechaInicio: new Date(`${d.fecha}T${d.horaInicio}`).toISOString(),
      fechaFin: d.horaFin ? new Date(`${d.fecha}T${d.horaFin}`).toISOString() : null,
      lugar: d.lugar,
      descripcion: d.descripcion || null,
      ministerioId: d.ministerioId === SIN_MINISTERIO ? null : d.ministerioId,
    }));
}

export type FormEvento = z.input<ReturnType<typeof crearEsquemaEvento>>;
