import { CalendarDays, Megaphone, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Badge, Card, CardContent } from '@/components/ui/card';
import { formatearFechaHora } from '@/lib/formato';
import { cn } from '@/lib/utils';
import type { Anuncio } from '@/types/anuncios';
import { MarkdownSimple } from './MarkdownSimple';

interface TarjetaAnuncioProps {
  anuncio: Pick<Anuncio, 'titulo' | 'contenido' | 'prioridad' | 'fechaPublicacion'> &
    Partial<Pick<Anuncio, 'autor' | 'evento' | 'fechaExpiracion'>>;
  /** Variante para el dashboard (F4): sin autor ni acciones, extracto corto */
  compacta?: boolean;
  /** Botones de edición (los pasa la página según permisos) */
  acciones?: ReactNode;
  className?: string;
}

/**
 * Tarjeta de anuncio con título, extracto, badge "Importante", fecha, autor y evento vinculado.
 * @example <TarjetaAnuncio anuncio={a} compacta />  // dashboard (F4, sin modificarla)
 */
export function TarjetaAnuncio({
  anuncio,
  compacta = false,
  acciones,
  className,
}: TarjetaAnuncioProps) {
  const importante = anuncio.prioridad === 'IMPORTANTE';
  return (
    <Card className={cn(importante && 'border-acento', className)}>
      <CardContent className={cn('flex flex-col gap-2', compacta ? 'p-3' : 'p-4')}>
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn('font-semibold', compacta ? 'text-sm' : 'text-base')}>
            {importante ? (
              <Star className="mr-1 inline size-4 text-acento" aria-hidden />
            ) : (
              <Megaphone className="mr-1 inline size-4 text-texto-suave" aria-hidden />
            )}
            {anuncio.titulo}
          </h3>
          {importante && <Badge variante="acento">Importante</Badge>}
        </div>
        <MarkdownSimple
          texto={anuncio.contenido}
          className={cn('text-sm', compacta && 'line-clamp-3')}
        />
        <p className="text-xs text-texto-suave">
          Publicado {formatearFechaHora(anuncio.fechaPublicacion)}
          {!compacta && anuncio.autor && ` por ${anuncio.autor.nombre}`}
          {!compacta &&
            anuncio.fechaExpiracion &&
            ` · Expira ${formatearFechaHora(anuncio.fechaExpiracion)}`}
        </p>
        {anuncio.evento && (
          <p className="flex items-center gap-1 text-sm">
            <CalendarDays className="size-4 text-texto-suave" aria-hidden />
            <Link to={`/eventos/${anuncio.evento.id}`} className="text-primario hover:underline">
              {anuncio.evento.titulo}
            </Link>
            <span className="text-texto-suave">
              · {formatearFechaHora(anuncio.evento.fechaInicio)}
            </span>
          </p>
        )}
        {acciones && <div className="flex flex-wrap justify-end gap-2">{acciones}</div>}
      </CardContent>
    </Card>
  );
}
