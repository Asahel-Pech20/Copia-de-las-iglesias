import { cloneElement, isValidElement, type ReactElement, type ReactNode, useId } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  /** Texto del label (obligatorio por accesibilidad) */
  label: string;
  /** Mensaje de error; se asocia al control con aria-describedby y marca aria-invalid */
  error?: string;
  /** Texto de ayuda bajo el control */
  hint?: ReactNode;
  /** Muestra un asterisco en el label */
  requerido?: boolean;
  className?: string;
  /** Un único control (Input, Textarea, SelectTrigger…). Recibe id, aria-invalid y aria-describedby. */
  children: ReactElement<Record<string, unknown>>;
}

/**
 * Campo de formulario accesible: label + control + hint + error.
 * @example
 * <FormField label="Correo" error={errors.email?.message}>
 *   <Input type="email" {...register('email')} />
 * </FormField>
 */
export function FormField({ label, error, hint, requerido, className, children }: FormFieldProps) {
  const id = useId();
  const idControl = (children.props.id as string | undefined) ?? `campo-${id}`;
  const idHint = hint ? `${idControl}-hint` : undefined;
  const idError = error ? `${idControl}-error` : undefined;
  const describedBy = [idHint, idError].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: idControl,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': requerido || undefined,
      })
    : children;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={idControl}>
        {label}
        {requerido && (
          <span className="text-peligro" aria-hidden>
            {' '}
            *
          </span>
        )}
      </Label>
      {control}
      {hint && (
        <p id={idHint} className="text-xs text-texto-suave">
          {hint}
        </p>
      )}
      {error && (
        <p id={idError} className="text-xs text-peligro">
          {error}
        </p>
      )}
    </div>
  );
}
