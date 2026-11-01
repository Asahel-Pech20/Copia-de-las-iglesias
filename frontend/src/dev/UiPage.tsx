import { Bell, Moon, Sun, Trash2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui/card';
import { Checkbox, Switch } from '@/components/ui/controles';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTema } from '@/hooks/useTema';

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">{titulo}</h2>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}

/** Catálogo de componentes (solo en desarrollo): /_dev/ui */
export function UiPage({ extra }: { extra?: ReactNode }) {
  const { alternar } = useTema();
  const [fecha, setFecha] = useState<Date | undefined>(new Date());

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Catálogo de componentes</h1>
          <p className="text-texto-suave">Tokens de AGENTS.md §4 en modo claro y oscuro.</p>
        </div>
        <Button variante="contorno" onClick={alternar}>
          <Sun className="dark:hidden" aria-hidden />
          <Moon className="hidden dark:block" aria-hidden />
          Alternar tema
        </Button>
      </header>

      <Seccion titulo="Colores">
        {['primario', 'acento', 'exito', 'alerta', 'peligro', 'texto', 'texto-suave', 'borde'].map(
          (token) => (
            <div key={token} className="flex flex-col items-center gap-1 text-xs">
              <div
                className="size-12 rounded-lg border shadow-sm"
                style={{ background: `var(--${token})` }}
              />
              {token}
            </div>
          ),
        )}
      </Seccion>

      <Seccion titulo="Botones">
        <Button>Primario</Button>
        <Button variante="contorno">Contorno</Button>
        <Button variante="secundario">Secundario</Button>
        <Button variante="fantasma">Fantasma</Button>
        <Button variante="enlace">Enlace</Button>
        <Button variante="peligro">
          <Trash2 aria-hidden /> Eliminar
        </Button>
        <Button disabled>Deshabilitado</Button>
        <Button tamano="icono" variante="contorno" aria-label="Notificaciones">
          <Bell aria-hidden />
        </Button>
      </Seccion>

      <Seccion titulo="Formulario">
        <div className="flex w-full max-w-xs flex-col gap-1.5">
          <Label htmlFor="dev-nombre">Nombre</Label>
          <Input id="dev-nombre" placeholder="Ana López" />
        </div>
        <div className="flex w-full max-w-xs flex-col gap-1.5">
          <Label htmlFor="dev-error">Con error</Label>
          <Input id="dev-error" aria-invalid defaultValue="correo@" />
          <p className="text-xs text-peligro">Correo no válido.</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-1.5">
          <Label>Rol</Label>
          <Select>
            <SelectTrigger aria-label="Rol">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="PASTOR">Pastor</SelectItem>
              <SelectItem value="TESORERO">Tesorero</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full max-w-md flex-col gap-1.5">
          <Label htmlFor="dev-notas">Notas</Label>
          <Textarea id="dev-notas" placeholder="Escribe algo…" />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="dev-check" defaultChecked />
          <Label htmlFor="dev-check">Activo</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="dev-switch" defaultChecked />
          <Label htmlFor="dev-switch">Notificaciones</Label>
        </div>
      </Seccion>

      <Seccion titulo="Superposiciones">
        <Dialog>
          <DialogTrigger asChild>
            <Button variante="contorno">Abrir diálogo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desactivar miembro</DialogTitle>
              <DialogDescription>El miembro dejará de aparecer en los listados.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variante="peligro">Desactivar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger asChild>
            <Button variante="contorno">Abrir panel</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Menú</SheetTitle>
            <p className="text-texto-suave">Contenido del panel lateral.</p>
          </SheetContent>
        </Sheet>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variante="contorno">Menú</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem peligro>Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <PopoverTrigger asChild>
            <Button variante="contorno">Popover</Button>
          </PopoverTrigger>
          <PopoverContent>Contenido flotante.</PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variante="contorno">Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>Ayuda breve</TooltipContent>
        </Tooltip>
        <Button variante="contorno" onClick={() => toast.success('Miembro guardado')}>
          Toast
        </Button>
      </Seccion>

      <Seccion titulo="Pestañas, calendario y tarjetas">
        <Tabs defaultValue="general" className="w-full max-w-sm">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="logo">Logotipo</TabsTrigger>
            <TabsTrigger value="horarios">Horarios</TabsTrigger>
          </TabsList>
          <TabsContent value="general">Contenido general.</TabsContent>
          <TabsContent value="logo">Contenido del logotipo.</TabsContent>
          <TabsContent value="horarios">Contenido de horarios.</TabsContent>
        </Tabs>
        <Card>
          <Calendar mode="single" selected={fecha} onSelect={setFecha} />
        </Card>
        <Card className="w-64">
          <CardHeader>
            <CardTitle>Miembros activos</CardTitle>
            <CardDescription>Total registrado</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">120</CardContent>
        </Card>
      </Seccion>

      <Seccion titulo="Estados">
        <Badge>Neutro</Badge>
        <Badge variante="primario">Primario</Badge>
        <Badge variante="acento">Destacado</Badge>
        <Badge variante="exito">Activo</Badge>
        <Badge variante="alerta">Pendiente</Badge>
        <Badge variante="peligro">Cancelado</Badge>
        <Alert>Mensaje informativo.</Alert>
        <Alert variante="peligro">Correo o contraseña incorrectos.</Alert>
        <div className="flex w-48 flex-col gap-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Seccion>

      <Seccion titulo="Tabla">
        <Card className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Ana López</TableCell>
                <TableCell>ana@iglesia.mx</TableCell>
                <TableCell>
                  <Badge variante="exito">Activo</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Luis Pérez</TableCell>
                <TableCell>luis@iglesia.mx</TableCell>
                <TableCell>
                  <Badge>Inactivo</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Seccion>

      {extra}
    </main>
  );
}
