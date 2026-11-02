import { Home, type LucideIcon, Network, Settings, UserCog, Users } from 'lucide-react';
import type { Permiso } from '@/types/comunes';

export interface EntradaMenu {
  etiqueta: string;
  ruta: string;
  icono: LucideIcon;
  /** Si se omite, la ve cualquier usuario autenticado */
  permiso?: Permiso | Permiso[];
}

/**
 * Menú lateral, filtrado por permisos en MenuNavegacion.
 * F2–F4: agreguen aquí sus entradas (p. ej. { etiqueta: 'Miembros', ruta: '/miembros', icono: Users, permiso: 'miembros:leer' })
 * y su ruta en app/router.tsx con el mismo permiso.
 */
export const MENU: EntradaMenu[] = [
  { etiqueta: 'Inicio', ruta: '/', icono: Home },
  { etiqueta: 'Miembros', ruta: '/miembros', icono: Users, permiso: 'miembros:leer' },
  { etiqueta: 'Ministerios', ruta: '/ministerios', icono: Network, permiso: 'ministerios:leer' },
  { etiqueta: 'Usuarios', ruta: '/usuarios', icono: UserCog, permiso: 'usuarios:leer' },
  {
    etiqueta: 'Configuración',
    ruta: '/configuracion',
    icono: Settings,
    permiso: 'configuracion:leer',
  },
];
