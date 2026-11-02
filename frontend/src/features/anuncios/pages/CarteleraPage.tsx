import { CalendarDays, Clock, Globe, LogIn, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { EmptyState, ErrorState, SkeletonTabla } from '@/components/comunes/Estados';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ESTILO_CATEGORIA } from '@/features/eventos/estilos';
import { DIAS_SEMANA, ETIQUETAS_CATEGORIA_EVENTO, formatearFechaHora } from '@/lib/formato';
import { cn } from '@/lib/utils';
import { TarjetaAnuncio } from '../components/TarjetaAnuncio';
import { useCartelera } from '../hooks';

const CINCO_MINUTOS = 5 * 60_000;

/**
 * /cartelera: pública (sin sesión) para miembros, celular o pantalla/TV (F3-13).
 * Con ?pantalla=1 usa letra grande y se actualiza sola cada 5 minutos.
 */
export function CarteleraPage() {
  const [params] = useSearchParams();
  const pantalla = params.get('pantalla') === '1';
  const consulta = useCartelera(pantalla ? CINCO_MINUTOS : undefined);
  const datos = consulta.data;

  return (
    <div className={cn('min-h-dvh bg-fondo text-texto', pantalla && 'text-lg')}>
      <header className="border-b bg-superficie">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            {datos?.iglesia.logoUrl && (
              <img
                src={datos.iglesia.logoUrl}
                alt=""
                className={cn('rounded-lg object-contain', pantalla ? 'size-20' : 'size-12')}
              />
            )}
            <div>
              <h1 className={cn('font-semibold', pantalla ? 'text-2xl' : 'text-xl')}>
                {datos?.iglesia.nombre ?? 'Cartelera'}
              </h1>
              <p className="text-sm text-texto-suave">Anuncios, próximos eventos y horarios</p>
            </div>
          </div>
          {!pantalla && (
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-superficie-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-anillo"
            >
              <LogIn className="size-4" aria-hidden /> Acceso del personal
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-3">
        {consulta.isPending ? (
          <Card className="lg:col-span-3">
            <SkeletonTabla filas={4} columnas={2} />
          </Card>
        ) : consulta.isError ? (
          <Card className="lg:col-span-3">
            <ErrorState error={consulta.error} alReintentar={() => consulta.refetch()} />
          </Card>
        ) : (
          <>
            <section
              aria-labelledby="titulo-anuncios"
              className="flex flex-col gap-3 lg:col-span-2"
            >
              <h2
                id="titulo-anuncios"
                className={cn('font-semibold', pantalla ? 'text-2xl' : 'text-lg')}
              >
                Anuncios
              </h2>
              {datos!.anuncios.length === 0 ? (
                <Card>
                  <EmptyState titulo="No hay anuncios por ahora" />
                </Card>
              ) : (
                <ul className="flex flex-col gap-3">
                  {datos!.anuncios.map((a) => (
                    <li key={a.id}>
                      <TarjetaAnuncio anuncio={a} className={cn(pantalla && '[&_*]:text-lg')} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="flex flex-col gap-4">
              <section aria-labelledby="titulo-eventos">
                <Card>
                  <CardHeader>
                    <CardTitle id="titulo-eventos" className="flex items-center gap-2">
                      <CalendarDays className="size-5" aria-hidden /> Próximos eventos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {datos!.eventosProximos.length === 0 ? (
                      <p className="text-texto-suave">No hay eventos programados.</p>
                    ) : (
                      <ul className="flex flex-col divide-y">
                        {datos!.eventosProximos.map((e) => {
                          const { clase, icono: Icono } = ESTILO_CATEGORIA[e.categoria];
                          return (
                            <li key={e.id} className="flex gap-3 py-3">
                              <span
                                className={cn(
                                  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
                                  clase,
                                )}
                              >
                                <Icono className="size-4" aria-hidden />
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium">{e.titulo}</p>
                                <p className="text-sm text-texto-suave">
                                  {ETIQUETAS_CATEGORIA_EVENTO[e.categoria]} ·{' '}
                                  {formatearFechaHora(e.fechaInicio)}
                                </p>
                                <p className="flex items-center gap-1 text-sm text-texto-suave">
                                  <MapPin className="size-3.5" aria-hidden /> {e.lugar}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section aria-labelledby="titulo-horarios">
                <Card>
                  <CardHeader>
                    <CardTitle id="titulo-horarios" className="flex items-center gap-2">
                      <Clock className="size-5" aria-hidden /> Horarios de reunión
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {datos!.horarios.length === 0 ? (
                      <p className="text-texto-suave">Sin horarios publicados.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {datos!.horarios.map((h) => (
                          <li key={h.id}>
                            <p className="font-medium">{h.nombre}</p>
                            <p className="text-sm text-texto-suave">
                              {DIAS_SEMANA[h.diaSemana]} {h.horaInicio}
                              {h.horaFin && `–${h.horaFin}`}
                              {h.lugar && ` · ${h.lugar}`}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section aria-labelledby="titulo-contacto">
                <Card>
                  <CardHeader>
                    <CardTitle id="titulo-contacto">Contacto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-2 text-sm">
                      {(datos!.iglesia.direccion || datos!.iglesia.ciudad) && (
                        <li className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                          {[datos!.iglesia.direccion, datos!.iglesia.ciudad]
                            .filter(Boolean)
                            .join(', ')}
                        </li>
                      )}
                      {datos!.iglesia.telefono && (
                        <li className="flex items-center gap-2">
                          <Phone className="size-4" aria-hidden />
                          <a className="hover:underline" href={`tel:${datos!.iglesia.telefono}`}>
                            {datos!.iglesia.telefono}
                          </a>
                        </li>
                      )}
                      {datos!.iglesia.email && (
                        <li className="flex items-center gap-2">
                          <Mail className="size-4" aria-hidden />
                          <a className="hover:underline" href={`mailto:${datos!.iglesia.email}`}>
                            {datos!.iglesia.email}
                          </a>
                        </li>
                      )}
                      {datos!.iglesia.sitioWeb && (
                        <li className="flex items-center gap-2">
                          <Globe className="size-4" aria-hidden />
                          <a
                            className="hover:underline"
                            href={datos!.iglesia.sitioWeb}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {datos!.iglesia.sitioWeb}
                          </a>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
