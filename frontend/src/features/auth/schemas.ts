import { z } from 'zod';

// Mismas reglas que el backend (AGENTS.md §3: contraseña mínima 8, con letra y número)
export const esquemaPassword = z
  .string()
  .min(8, 'Mínimo 8 caracteres.')
  .regex(/[a-zA-Z]/, 'Debe incluir al menos una letra.')
  .regex(/\d/, 'Debe incluir al menos un número.');

export const esquemaLogin = z.object({
  email: z.string().trim().min(1, 'Escribe tu correo.').pipe(z.email('Correo no válido.')),
  password: z.string().min(1, 'Escribe tu contraseña.'),
});

export const esquemaRecuperar = z.object({
  email: z.string().trim().min(1, 'Escribe tu correo.').pipe(z.email('Correo no válido.')),
});

export const esquemaRestablecer = z
  .object({ password: esquemaPassword, confirmacion: z.string() })
  .refine((d) => d.password === d.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden.',
  });

export const esquemaCambiarPassword = z
  .object({
    passwordActual: z.string().min(1, 'Escribe tu contraseña actual.'),
    passwordNueva: esquemaPassword,
    confirmacion: z.string(),
  })
  .refine((d) => d.passwordNueva === d.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden.',
  });

export type DatosLogin = z.infer<typeof esquemaLogin>;
export type DatosRecuperar = z.infer<typeof esquemaRecuperar>;
export type DatosRestablecer = z.infer<typeof esquemaRestablecer>;
export type DatosCambiarPassword = z.infer<typeof esquemaCambiarPassword>;
