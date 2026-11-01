import { Church } from 'lucide-react';
import { useConfiguracion } from '@/features/configuracion/hooks';
import { cn } from '@/lib/utils';

/** Logo + nombre de la iglesia (de la configuración). */
export function MarcaIglesia({ className, grande }: { className?: string; grande?: boolean }) {
  const { data: config } = useConfiguracion();
  const nombre = config?.nombre ?? 'AppIglesia';
  const tamano = grande ? 'size-14' : 'size-9';
  return (
    <div className={cn('flex min-w-0 items-center gap-3', grande && 'flex-col', className)}>
      {config?.logoUrl ? (
        <img
          src={config.logoUrl}
          alt=""
          className={cn(tamano, 'shrink-0 rounded-lg object-contain')}
        />
      ) : (
        <span
          className={cn(
            tamano,
            'flex shrink-0 items-center justify-center rounded-lg bg-primario text-primario-texto',
          )}
          aria-hidden
        >
          <Church className={grande ? 'size-7' : 'size-5'} />
        </span>
      )}
      <span
        className={cn('font-semibold', grande ? 'text-center text-lg' : 'truncate text-sm')}
        title={nombre}
      >
        {nombre}
      </span>
    </div>
  );
}
