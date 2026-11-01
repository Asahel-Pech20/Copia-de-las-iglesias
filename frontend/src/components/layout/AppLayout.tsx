import { ChevronDown, LogOut, Menu, Moon, Sun, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useSesion } from '@/features/auth/contexto';
import { useTema } from '@/hooks/useTema';
import { ETIQUETAS_ROL } from '@/lib/formato';
import { MarcaIglesia } from './MarcaIglesia';
import { MenuNavegacion } from './MenuNavegacion';

/** Layout principal: barra lateral (240 px) + barra superior + contenido. En móvil el menú va en un Sheet. */
export function AppLayout() {
  const { usuario, cerrarSesion } = useSesion();
  const { alternar } = useTema();
  const [menuMovil, setMenuMovil] = useState(false);

  return (
    <div className="min-h-dvh bg-fondo">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-primario px-3 py-2 text-primario-texto focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Saltar al contenido
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-6 border-r bg-superficie p-4 md:flex">
        <MarcaIglesia />
        <MenuNavegacion />
      </aside>

      <Sheet open={menuMovil} onOpenChange={setMenuMovil}>
        <SheetContent>
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <SheetDescription className="sr-only">Navegación principal</SheetDescription>
          <MarcaIglesia />
          <MenuNavegacion alNavegar={() => setMenuMovil(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-dvh flex-col md:pl-60">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-superficie/95 px-4 backdrop-blur">
          <Button
            variante="fantasma"
            tamano="icono"
            className="md:hidden"
            aria-label="Abrir menú"
            onClick={() => setMenuMovil(true)}
          >
            <Menu aria-hidden />
          </Button>
          <MarcaIglesia className="md:hidden" />

          <div className="ml-auto flex items-center gap-1">
            <Button
              variante="fantasma"
              tamano="icono"
              aria-label="Alternar tema"
              onClick={alternar}
            >
              <Sun className="dark:hidden" aria-hidden />
              <Moon className="hidden dark:block" aria-hidden />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variante="fantasma" className="max-w-56 gap-2 px-2">
                  <UserRound aria-hidden />
                  <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
                    <span className="max-w-40 truncate">{usuario?.nombre}</span>
                    <span className="text-xs font-normal text-texto-suave">
                      {usuario && ETIQUETAS_ROL[usuario.rol]}
                    </span>
                  </span>
                  <ChevronDown className="opacity-60" aria-hidden />
                  <span className="sr-only">Menú de cuenta</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block truncate font-medium">{usuario?.nombre}</span>
                  <span className="block truncate text-xs text-texto-suave">{usuario?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/mi-cuenta">
                    <UserRound aria-hidden /> Mi cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem peligro onSelect={() => void cerrarSesion()}>
                  <LogOut aria-hidden /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main id="contenido" tabIndex={-1} className="flex-1 p-4 outline-none sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
