import { z } from 'zod';
import { aFechaApi } from '@/lib/formato';

// Espejo de backend/src/modules/miembros/miembros.schemas.ts

const noFutura = (valor: string) => valor <= aFechaApi(new Date());
const esCorreo = (valor: string) => z.email().safeParse(valor).success;
const esTelefono = (valor: string) => /^\+?\d{7,15}$/.test(valor.replace(/[\s-]/g, ''));

/** Texto opcional: vacío → null (así se borra en la API) */
const opcional = (max: number, valido: (v: string) => boolean = () => true, mensaje?: string) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => v === '' || valido(v), mensaje)
    .transform((v) => (v === '' ? null : v));

export const esquemaMiembro = z.object({
  nombre: z.string().trim().min(1, 'Escribe el nombre.').max(80),
  apellidos: z.string().trim().min(1, 'Escribe los apellidos.').max(120),
  fechaIngreso: z
    .string({ error: 'Selecciona la fecha de ingreso.' })
    .min(1, 'Selecciona la fecha de ingreso.')
    .refine(noFutura, 'La fecha de ingreso no puede ser futura.'),
  telefono: opcional(30, esTelefono, 'El teléfono debe tener de 7 a 15 dígitos.'),
  email: opcional(254, esCorreo, 'Correo no válido.').transform((v) => v?.toLowerCase() ?? null),
  fechaNacimiento: z
    .string()
    .nullable()
    .refine((v) => !v || noFutura(v), 'La fecha de nacimiento no puede ser futura.'),
  direccion: opcional(250),
  notas: opcional(1000),
});

/** Valores del formulario (lo que escribe el usuario) */
export type FormMiembro = z.input<typeof esquemaMiembro>;
/** Datos validados, listos para la API */
export type DatosMiembro = z.output<typeof esquemaMiembro>;
