import { NavLink } from 'react-router';
import { type EntradaMenu, MENU } from '@/app/menu';
import { useSesion } from '@/features/auth/contexto';
import { cn } from '@/lib/utils';

function visible(entrada: EntradaMenu, permisos: readonly string[]) {
  if (!entrada.permiso) return true;
  return [entrada.permiso].flat().some((p) => permisos.includes(p));
}

/** Lista de navegación filtrada por los permisos del usuario. */
export function MenuNavegacion({ alNavegar }: { alNavegar?: () => void }) {
  const { permisos } = useSesion();
  return (
    <nav aria-label="Menú principal">
      <ul className="flex flex-col gap-1">
        {MENU.filter((e) => visible(e, permisos)).map(({ etiqueta, ruta, icono: Icono }) => (
          <li key={ruta}>
            <NavLink
              to={ruta}
              end={ruta === '/'}
              onClick={alNavegar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primario text-primario-texto'
                    : 'text-texto-suave hover:bg-superficie-suave hover:text-texto',
                )
              }
            >
              <Icono className="size-5 shrink-0" aria-hidden />
              {etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
