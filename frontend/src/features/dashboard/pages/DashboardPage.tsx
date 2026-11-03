import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Banknote, ClipboardCheck, Megaphone, Network, Users } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Link } from 'react-router';
import { ErrorState, StatCard } from '@/components/comunes/Estados';
import { PageHeader } from '@/components/comunes/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui/card';
import { useSesion } from '@/features/auth/contexto';
import { textoVariacion } from '@/features/donaciones/formato';
import { ListaEventos } from '@/features/eventos/components/ListaEventos';
import { TarjetaAnuncio } from '@/features/anuncios/components/TarjetaAnuncio';
import { usePermiso } from '@/hooks/usePermiso';
import { useFormatoMoneda } from '@/hooks/useFormatoMoneda';
import { cn } from '@/lib/utils';
import type { Dashboard } from '@/types/dashboard';
import { GraficaBarras, TarjetaGrafica } from '../components/Graficas';
import { useDashboard } from '../hooks';

function saludo(hora = new Date().getHours()) {
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** "2026-W43" → "S43" · "2026-10" → "oct 26" (marcas cortas de los ejes) */
const semanaCorta = (clave: string) => `S${clave.slice(-2)}`;
const mesCorto = (clave: string) =>
  format(parseISO(`${clave}-01T00:00:00`), 'MMM yy', { locale: es });
const moneda_compacta = new Intl.NumberFormat('es-MX', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Panel principal (F4-06 … F4-08). */
export function DashboardPage() {
  const { usuario } = useSesion();
  const consulta = useDashboard();
  const d = consulta.data;

  return (
    <>
      <PageHeader
        titulo={`${saludo()}, ${usuario?.nombre ?? ''}`}
        descripcion="Resumen de la actividad de la iglesia."
      />
      {consulta.isError ? (
        <Card>
          <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
            <Indicadores d={d} />
            {d ? <Graficas d={d} /> : <GraficasCargando />}
          </div>
          <aside aria-label="Eventos y avisos" className="flex min-w-0 flex-col gap-6">
            <EventosProximos d={d} />
            <AvisosImportantes d={d} />
          </aside>
        </div>
      )}
    </>
  );
}

/** StatCard que enlaza a su módulo (si el usuario puede entrar). */
function Indicador({
  enlace,
  nombre,
  ...props
}: ComponentProps<typeof StatCard> & { enlace?: string; nombre: string }) {
  if (!enlace) return <StatCard {...props} />;
  return (
    <Link
      to={enlace}
      aria-label={nombre}
      className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anillo"
    >
      <StatCard {...props} />
    </Link>
  );
}

function Indicadores({ d }: { d: Dashboard | undefined }) {
  const moneda = useFormatoMoneda();
  const verAsistencia = usePermiso('asistencia:leer', 'asistencia:leer-propio');
  const verMiembros = usePermiso('miembros:leer');
  const verMinisterios = usePermiso('ministerios:leer');
  const verDonaciones = usePermiso('donaciones:leer');
  const cargando = d === undefined;
  // `ingresos` solo existe en la respuesta si el rol puede verlos: sin la clave, no hay tarjeta ni hueco
  const ingresos = d?.ingresos;

  return (
    <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Indicador
        nombre="Miembros activos: ir a miembros"
        enlace={verMiembros ? '/miembros' : undefined}
        titulo="Miembros activos"
        valor={d?.miembrosActivos.toLocaleString('es-MX')}
        icono={Users}
        cargando={cargando}
      />
      <Indicador
        nombre="Asistencias del mes: ir a asistencia"
        enlace={verAsistencia ? '/asistencia' : undefined}
        titulo="Asistencias del mes"
        valor={d?.asistenciasRegistradas.mesActual.toLocaleString('es-MX')}
        descripcion={
          d && `Esta semana: ${d.asistenciasRegistradas.semanaActual.toLocaleString('es-MX')}`
        }
        icono={ClipboardCheck}
        cargando={cargando}
      />
      <Indicador
        nombre="Ministerios: ir a ministerios"
        enlace={verMinisterios ? '/ministerios' : undefined}
        titulo="Ministerios"
        valor={d?.totalMinisterios.toLocaleString('es-MX')}
        icono={Network}
        cargando={cargando}
      />
      {ingresos && (
        <Indicador
          nombre="Ingresos del mes: ir a donaciones"
          enlace={verDonaciones ? '/donaciones' : undefined}
          titulo="Ingresos del mes"
          valor={moneda(ingresos.mesActual)}
          descripcion={
            ingresos.variacionPorcentual === null ? (
              'Sin datos del mes anterior'
            ) : (
              <span
                className={cn(
                  'font-medium',
                  ingresos.variacionPorcentual >= 0 ? 'text-exito' : 'text-peligro',
                )}
              >
                {ingresos.variacionPorcentual >= 0 ? '▲' : '▼'}{' '}
                {textoVariacion(ingresos.variacionPorcentual)} vs. mes anterior
              </span>
            )
          }
          icono={Banknote}
        />
      )}
    </section>
  );
}

function Graficas({ d }: { d: Dashboard }) {
  const moneda = useFormatoMoneda();
  const { asistenciaSemanal, miembrosPorMinisterio, altasMiembrosPorMes } = d.graficas;
  const totalAsistencia = asistenciaSemanal.reduce((s, x) => s + x.presentes, 0);
  const totalAltas = altasMiembrosPorMes.reduce((s, x) => s + x.total, 0);

  return (
    <section aria-label="Gráficas" className="grid gap-6 xl:grid-cols-2">
      <TarjetaGrafica
        titulo="Asistencia semanal"
        descripcion={`Presentes por semana en las últimas ${asistenciaSemanal.length} semanas: ${totalAsistencia.toLocaleString('es-MX')} en total.`}
        tabla={{
          encabezados: ['Semana', 'Presentes', 'Ausentes', 'Eventos'],
          filas: asistenciaSemanal.map((s) => [s.semana, s.presentes, s.ausentes, s.eventos]),
        }}
      >
        <GraficaBarras
          nombre="Presentes"
          datos={asistenciaSemanal.map((s) => ({
            etiqueta: semanaCorta(s.semana),
            valor: s.presentes,
          }))}
        />
      </TarjetaGrafica>

      <TarjetaGrafica
        titulo="Miembros por ministerio"
        descripcion={
          miembrosPorMinisterio[0]
            ? `El ministerio con más integrantes es ${miembrosPorMinisterio[0].ministerio} (${miembrosPorMinisterio[0].total}).`
            : 'Aún no hay ministerios con integrantes.'
        }
        vacio={miembrosPorMinisterio.length === 0 ? 'Aún no hay ministerios.' : undefined}
        tabla={{
          encabezados: ['Ministerio', 'Integrantes'],
          filas: miembrosPorMinisterio.map((m) => [m.ministerio, m.total]),
        }}
      >
        <GraficaBarras
          horizontal
          nombre="Integrantes"
          color="var(--acento)"
          datos={miembrosPorMinisterio.map((m) => ({ etiqueta: m.ministerio, valor: m.total }))}
        />
      </TarjetaGrafica>

      <TarjetaGrafica
        titulo="Altas de miembros por mes"
        descripcion={`${totalAltas} ${totalAltas === 1 ? 'alta' : 'altas'} en los últimos ${altasMiembrosPorMes.length} meses.`}
        tabla={{
          encabezados: ['Mes', 'Altas'],
          filas: altasMiembrosPorMes.map((a) => [a.mes, a.total]),
        }}
      >
        <GraficaBarras
          nombre="Altas"
          color="var(--exito)"
          datos={altasMiembrosPorMes.map((a) => ({ etiqueta: mesCorto(a.mes), valor: a.total }))}
        />
      </TarjetaGrafica>

      {d.ingresos && (
        <TarjetaGrafica
          titulo="Ingresos por mes"
          descripcion={`Ingresos de los últimos ${d.ingresos.porMes.length} meses; este mes ${moneda(d.ingresos.mesActual)}.`}
          tabla={{
            encabezados: ['Mes', 'Total'],
            filas: d.ingresos.porMes.map((m) => [m.mes, moneda(m.total)]),
          }}
        >
          <GraficaBarras
            nombre="Ingresos"
            formatoValor={moneda}
            formatoEje={(v) => moneda_compacta.format(v)}
            datos={d.ingresos.porMes.map((m) => ({
              etiqueta: mesCorto(m.mes),
              valor: Number(m.total),
            }))}
          />
        </TarjetaGrafica>
      )}
    </section>
  );
}

function EventosProximos({ d }: { d: Dashboard | undefined }) {
  const puedeVer = usePermiso('eventos:leer');
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Próximos eventos</CardTitle>
        {puedeVer && (
          <Link to="/eventos" className="text-sm text-primario hover:underline">
            Ver todos
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <ListaEventos
          eventos={d?.eventosProximos}
          cargando={d === undefined}
          vacio="No hay eventos próximos."
          etiqueta="Próximos eventos"
        />
      </CardContent>
    </Card>
  );
}

function AvisosImportantes({ d }: { d: Dashboard | undefined }) {
  const puedeVer = usePermiso('anuncios:leer');
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Avisos importantes</CardTitle>
        {puedeVer && (
          <Link to="/anuncios" className="text-sm text-primario hover:underline">
            Ver todos
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {d === undefined ? (
          <p className="text-texto-suave">Cargando…</p>
        ) : d.anunciosImportantes.length === 0 ? (
          <p className="flex items-center gap-2 text-texto-suave">
            <Megaphone className="size-4" aria-hidden /> No hay avisos importantes.
          </p>
        ) : (
          d.anunciosImportantes.map((a) => <TarjetaAnuncio key={a.id} compacta anuncio={a} />)
        )}
      </CardContent>
    </Card>
  );
}

/** Esqueleto de las gráficas mientras carga, para que el contenido no salte al llegar los datos. */
function GraficasCargando() {
  return (
    <section aria-label="Cargando gráficas" className="grid gap-6 xl:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
