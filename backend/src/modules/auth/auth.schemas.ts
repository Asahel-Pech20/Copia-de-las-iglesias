import { z } from 'zod';
import { esquemaPassword } from '../../lib/seguridad';

const email = z.string().trim().toLowerCase().pipe(z.email('Correo no válido.'));

export const esquemaLogin = z.strictObject({
  email,
  password: z.string().min(1, 'Escribe tu contraseña.').max(200),
});

export const esquemaOlvide = z.strictObject({ email });

export const esquemaRestablecer = z.strictObject({
  token: z.string().min(1).max(200),
  password: esquemaPassword,
});

export const esquemaCambiarPassword = z.strictObject({
  passwordActual: z.string().min(1, 'Escribe tu contraseña actual.').max(200),
  passwordNueva: esquemaPassword,
});
