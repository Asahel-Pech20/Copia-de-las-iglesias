import { z } from 'zod';
import { MAX_LOGO_BYTES, MONEDAS, TIPOS_LOGO, ZONAS_HORARIAS } from './catalogos';

const opcional = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullable();

export const esquemaConfiguracion = z.object({
  nombre: z.string().trim().min(1, 'Escribe el nombre de la iglesia.').max(150),
  direccion: opcional,
  ciudad: opcional,
  telefono: opcional,
  email: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v.toLowerCase()))
    .nullable()
    .refine((v) => v === null || z.email().safeParse(v).success, 'Correo no válido.'),
  sitioWeb: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .refine((v) => v === null || z.url().safeParse(v).success, 'URL no válida (incluye https://).'),
  moneda: z.enum(Object.keys(MONEDAS) as [keyof typeof MONEDAS], { error: 'Moneda no válida.' }),
  zonaHoraria: z.enum(Object.keys(ZONAS_HORARIAS) as [keyof typeof ZONAS_HORARIAS], {
    error: 'Zona horaria no válida.',
  }),
});

export type DatosConfiguracion = z.input<typeof esquemaConfiguracion>;

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato HH:mm.');

export const esquemaHorario = z
  .object({
    nombre: z.string().trim().min(1, 'Escribe el nombre de la reunión.').max(100),
    diaSemana: z.number().int().min(0).max(6),
    horaInicio: hora,
    horaFin: z.union([hora, z.literal('')]).transform((v) => (v === '' ? null : v)),
    lugar: opcional,
    activo: z.boolean(),
  })
  .refine((h) => !h.horaFin || h.horaFin > h.horaInicio, {
    path: ['horaFin'],
    message: 'La hora de fin debe ser posterior a la de inicio.',
  });

export type DatosHorario = z.input<typeof esquemaHorario>;
export type HorarioValidado = z.output<typeof esquemaHorario>;

/** Valida el archivo del logo antes de subirlo; devuelve el mensaje de error o null. */
export function validarLogo(archivo: File): string | null {
  if (!(TIPOS_LOGO as readonly string[]).includes(archivo.type)) {
    return 'Formato no permitido. Usa PNG, JPG, WEBP o SVG.';
  }
  if (archivo.size > MAX_LOGO_BYTES) return 'El archivo supera 2 MB.';
  return null;
}
