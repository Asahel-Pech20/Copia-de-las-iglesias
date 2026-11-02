import { z } from 'zod';

// Espejo de backend/src/modules/ministerios/ministerios.schemas.ts
export const esquemaMinisterio = z.object({
  nombre: z.string().trim().min(1, 'Escribe el nombre.').max(80),
  descripcion: z
    .string()
    .trim()
    .max(500)
    .transform((v) => (v === '' ? null : v)),
});

export type FormMinisterio = z.input<typeof esquemaMinisterio>;
export type DatosMinisterio = z.output<typeof esquemaMinisterio>;
