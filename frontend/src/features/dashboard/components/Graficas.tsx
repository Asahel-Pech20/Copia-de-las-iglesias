import { BarChart3, Table2 } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Gráficas con Recharts. Los colores salen de los tokens de AGENTS.md §4 (variables CSS), así que
// cambian solos en modo oscuro. Toda gráfica lleva descripción en texto y tabla alternativa.

export interface PuntoGrafica {
  etiqueta: string;
  valor: number;
}

const COLORES = [
  'var(--primario)',
  'var(--acento)',
  'var(--exito)',
  'var(--peligro)',
  'var(--texto-suave)',
];

const ESTILO_TOOLTIP = {
  background: 'var(--superficie)',
  border: '1px solid var(--borde)',
  borderRadius: 8,
  color: 'var(--texto)',
  fontSize: 12,
};

const TICK = { fill: 'var(--texto-suave)', fontSize: 12 };

interface TarjetaGraficaProps {
  titulo: string;
  /** Resumen en texto de lo que muestra la gráfica (también es su nombre accesible) */
  descripcion: string;
  /** Tabla alternativa ("Ver como tabla") */
  tabla: { encabezados: string[]; filas: ReactNode[][] };
  /** Mensaje cuando no hay datos que graficar */
  vacio?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Tarjeta con título, descripción textual, la gráfica y el interruptor "Ver como tabla"
 * (F4-07, accesibilidad: AGENTS.md §4).
 */
export function TarjetaGrafica({
  titulo,
  descripcion,
  tabla,
  vacio,
  children,
  className,
}: TarjetaGraficaProps) {
  const [comoTabla, setComoTabla] = useState(false);
  const idTitulo = useId();
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle id={idTitulo}>{titulo}</CardTitle>
          <CardDescription>{descripcion}</CardDescription>
        </div>
        {!vacio && (
          <Button
            variante="fantasma"
            tamano="sm"
            aria-pressed={comoTabla}
            aria-label={`${comoTabla ? 'Ver como gráfica' : 'Ver como tabla'}: ${titulo}`}
            onClick={() => setComoTabla((v) => !v)}
          >
            {comoTabla ? <BarChart3 aria-hidden /> : <Table2 aria-hidden />}
            <span className="hidden sm:inline">{comoTabla ? 'Ver gráfica' : 'Ver como tabla'}</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {vacio ? (
          <p className="py-8 text-center text-texto-suave">{vacio}</p>
        ) : comoTabla ? (
          <div className="max-h-64 overflow-auto">
            <Table aria-label={`Datos de ${titulo}`}>
              <TableHeader>
                <TableRow>
                  {tabla.encabezados.map((e, i) => (
                    <TableHead key={e} className={cn(i > 0 && 'text-right')}>
                      {e}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tabla.filas.map((fila, f) => (
                  <TableRow key={f}>
                    {fila.map((celda, c) => (
                      <TableCell key={c} className={cn(c > 0 && 'text-right tabular-nums')}>
                        {celda}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div role="img" aria-labelledby={idTitulo} className="h-64 w-full">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface GraficaBarrasProps {
  datos: PuntoGrafica[];
  /** Barras horizontales (etiquetas largas, p. ej. ministerios) */
  horizontal?: boolean;
  /** Formato del valor en el tooltip */
  formatoValor?: (valor: number) => string;
  /** Formato de las marcas del eje (más corto que el tooltip; por defecto el mismo) */
  formatoEje?: (valor: number) => string;
  /** Nombre de la serie en el tooltip */
  nombre?: string;
  color?: string;
}

export function GraficaBarras({
  datos,
  horizontal = false,
  formatoValor = (v) => v.toLocaleString('es-MX'),
  formatoEje = formatoValor,
  nombre = 'Total',
  color = COLORES[0],
}: GraficaBarrasProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 256 }}>
      <BarChart
        data={datos}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 8, bottom: 0, left: horizontal ? 8 : 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--borde)" vertical={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={TICK} allowDecimals={false} tickFormatter={formatoEje} />
            <YAxis type="category" dataKey="etiqueta" tick={TICK} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey="etiqueta" tick={TICK} interval="preserveStartEnd" />
            <YAxis tick={TICK} width={56} allowDecimals={false} tickFormatter={formatoEje} />
          </>
        )}
        <Tooltip
          contentStyle={ESTILO_TOOLTIP}
          cursor={{ fill: 'var(--superficie-suave)' }}
          formatter={(valor) => [formatoValor(Number(valor)), nombre]}
        />
        <Bar dataKey="valor" fill={color} radius={4} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface GraficaDonaProps {
  datos: PuntoGrafica[];
  formatoValor?: (valor: number) => string;
}

export function GraficaDona({
  datos,
  formatoValor = (v) => v.toLocaleString('es-MX'),
}: GraficaDonaProps) {
  return (
    <div className="flex h-full flex-col items-center gap-2 sm:flex-row">
      <div className="h-40 w-full sm:h-full sm:w-1/2">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 160, height: 160 }}
        >
          <PieChart>
            <Pie
              data={datos}
              dataKey="valor"
              nameKey="etiqueta"
              innerRadius="55%"
              outerRadius="90%"
              stroke="var(--superficie)"
              isAnimationActive={false}
            >
              {datos.map((p, i) => (
                <Cell key={p.etiqueta} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={ESTILO_TOOLTIP}
              formatter={(valor, nombre) => [formatoValor(Number(valor)), String(nombre)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex w-full flex-col gap-1 text-sm sm:w-1/2" aria-label="Leyenda">
        {datos.map((p, i) => (
          <li key={p.etiqueta} className="flex items-center gap-2">
            <span
              className="size-3 shrink-0 rounded-sm"
              style={{ background: COLORES[i % COLORES.length] }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate">{p.etiqueta}</span>
            <span className="tabular-nums text-texto-suave">{formatoValor(p.valor)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
