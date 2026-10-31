import { z } from 'zod';
import { ROLES } from '@/lib/permisos';

export const esquemaUsuario = z.object({
  nombre: z.string().trim().min(1, 'Escribe el nombre.').max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Escribe el correo.')
    .pipe(z.email('Correo no válido.')),
  rol: z.enum(ROLES, { error: 'Selecciona un rol.' }),
});

export type DatosUsuario = z.infer<typeof esquemaUsuario>;
