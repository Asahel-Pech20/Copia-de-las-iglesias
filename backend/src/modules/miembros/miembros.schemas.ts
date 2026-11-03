import { z } from 'zod';
import { esquemaPaginacion } from '../../lib/paginacion';

const texto = (max: number) => z.string().trim().max(max);

// "No futura" se valida en el service con la zona horaria de la iglesia (hoyIglesia)
const fecha = z.iso.date('Fecha no válida (formato yyyy-MM-dd).');

// Teléfono: 7–15 dígitos; se aceptan +, espacios y guiones, y se guarda sin separadores
const telefono = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\+?\d{7,15}$/, 'El teléfono debe tener de 7 a 15 dígitos.'));

const email = z.string().trim().toLowerCase().pipe(z.email('Correo no válido.'));

// Opcionales: cadena vacía o null se guardan como null
const opcional = <T extends z.ZodType>(esquema: T) =>
  z.preprocess((v) => (v === '' ? null : v), esquema.nullable().optional());

const camposMiembro = {
  nombre: texto(80).min(1, 'Escribe el nombre.'),
  apellidos: texto(120).min(1, 'Escribe los apellidos.'),
  fechaIngreso: fecha,
  telefono: opcional(telefono),
  email: opcional(email),
  fechaNacimiento: opcional(fecha),
  direccion: opcional(texto(250)),
  notas: opcional(texto(1000)),
};

export const esquemaIdMiembro = z.object({ id: z.uuid('Identificador no válido.') });

export const esquemaListarMiembros = esquemaPaginacion.extend({
  estado: z.enum(['activo', 'inactivo', 'todos']).default('activo'),
  ministerioId: z.uuid('Identificador de ministerio no válido.').optional(),
});

export const esquemaCrearMiembro = z.strictObject(camposMiembro);

// `activo` no se acepta aquí: se cambia con PATCH /miembros/:id/estado (strict → 400)
export const esquemaEditarMiembro = z
  .strictObject({
    ...camposMiembro,
    nombre: camposMiembro.nombre.optional(),
    apellidos: camposMiembro.apellidos.optional(),
    fechaIngreso: camposMiembro.fechaIngreso.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, 'No hay cambios para guardar.');

export const esquemaEstadoMiembro = z.strictObject({
  activo: z.boolean(),
  motivo: texto(500).min(1).optional(),
});

export type QueryMiembros = z.infer<typeof esquemaListarMiembros>;
export type CrearMiembro = z.infer<typeof esquemaCrearMiembro>;
export type EditarMiembro = z.infer<typeof esquemaEditarMiembro>;
export type EstadoMiembro = z.infer<typeof esquemaEstadoMiembro>;
