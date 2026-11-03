import { format } from 'date-fns';
import { z } from 'zod';
import type { GuardarDonacion } from '@/types/donaciones';

// Espejo de backend/src/modules/donaciones/donaciones.schemas.ts.
// El monto viaja como string con hasta 2 decimales; nunca se convierte a number para sumar.

const CONCEPTOS = ['DIEZMO', 'OFRENDA', 'PRIMICIA', 'DONACION_ESPECIAL', 'OTRO'] as const;
const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO'] as const;

export const esquemaDonacion = z
  .object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona la fecha.'),
    monto: z
      .string()
      .trim()
      .min(1, 'Escribe el monto.')
      .refine((v) => /^\d{1,10}(\.\d{1,2})?$/.test(v), 'Monto no válido (hasta 2 decimales).')
      .refine((v) => Number(v) > 0, 'El monto debe ser mayor que cero.'),
    concepto: z.enum(CONCEPTOS, { error: 'Elige el concepto.' }),
    conceptoDetalle: z.string().trim().max(150, 'Máximo 150 caracteres.'),
    metodo: z.enum(METODOS, { error: 'Elige el método de recepción.' }),
    anonima: z.boolean(),
    miembroId: z.string().nullable(),
    referencia: z.string().trim().max(100, 'Máximo 100 caracteres.'),
    notas: z.string().trim().max(1000, 'Máximo 1 000 caracteres.'),
  })
  .superRefine((d, ctx) => {
    if (d.fecha > format(new Date(), 'yyyy-MM-dd')) {
      ctx.addIssue({ code: 'custom', path: ['fecha'], message: 'La fecha no puede ser futura.' });
    }
    if (d.concepto === 'OTRO' && !d.conceptoDetalle) {
      ctx.addIssue({
        code: 'custom',
        path: ['conceptoDetalle'],
        message: 'Describe el concepto cuando es "Otro".',
      });
    }
    if (d.anonima && d.miembroId) {
      ctx.addIssue({
        code: 'custom',
        path: ['miembroId'],
        message: 'Una aportación anónima no puede tener donante.',
      });
    }
    if (!d.anonima && !d.miembroId) {
      ctx.addIssue({
        code: 'custom',
        path: ['miembroId'],
        message: 'Elige el donante o marca la aportación como anónima.',
      });
    }
  })
  .transform((d): GuardarDonacion => ({
    fecha: d.fecha,
    monto: d.monto,
    concepto: d.concepto,
    conceptoDetalle: d.concepto === 'OTRO' ? d.conceptoDetalle : null,
    metodo: d.metodo,
    miembroId: d.anonima ? null : d.miembroId,
    anonima: d.anonima,
    referencia: d.referencia || null,
    notas: d.notas || null,
  }));

export type FormDonacion = z.input<typeof esquemaDonacion>;
