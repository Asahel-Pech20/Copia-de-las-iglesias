import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Markdown simple seguro: **negrita**, *cursiva*, [enlace](https://…), listas con "- " y títulos "#".
 * Nunca usa dangerouslySetInnerHTML: todo se arma con elementos de React, así que cualquier HTML
 * escrito en el contenido se muestra como texto (sanitizado, F3-11). Solo se enlazan URLs http(s).
 */

const PATRON_EN_LINEA = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;

function enLinea(texto: string): ReactNode[] {
  return texto.split(PATRON_EN_LINEA).map((parte, i) => {
    if (/^\*\*[^*]+\*\*$/.test(parte)) return <strong key={i}>{parte.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(parte)) return <em key={i}>{parte.slice(1, -1)}</em>;
    const enlace = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(parte);
    if (enlace) {
      const [, etiqueta, url] = enlace;
      return /^https?:\/\//i.test(url!) ? (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primario underline"
        >
          {etiqueta}
        </a>
      ) : (
        <Fragment key={i}>{etiqueta}</Fragment>
      );
    }
    return <Fragment key={i}>{parte}</Fragment>;
  });
}

export function MarkdownSimple({ texto, className }: { texto: string; className?: string }) {
  const bloques: ReactNode[] = [];
  let lista: string[] = [];
  let parrafo: string[] = [];

  const cerrarParrafo = () => {
    if (parrafo.length === 0) return;
    const lineas = parrafo;
    bloques.push(
      <p key={bloques.length}>
        {lineas.map((l, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {enLinea(l)}
          </Fragment>
        ))}
      </p>,
    );
    parrafo = [];
  };
  const cerrarLista = () => {
    if (lista.length === 0) return;
    bloques.push(
      <ul key={bloques.length} className="list-disc pl-5">
        {lista.map((l, i) => (
          <li key={i}>{enLinea(l)}</li>
        ))}
      </ul>,
    );
    lista = [];
  };

  for (const linea of texto.split(/\r?\n/)) {
    const item = /^\s*[-*]\s+(.*)$/.exec(linea);
    const titulo = /^#{1,3}\s+(.*)$/.exec(linea);
    if (item) {
      cerrarParrafo();
      lista.push(item[1]!);
    } else if (titulo) {
      cerrarParrafo();
      cerrarLista();
      bloques.push(
        <p key={bloques.length} className="font-semibold">
          {enLinea(titulo[1]!)}
        </p>,
      );
    } else if (linea.trim() === '') {
      cerrarParrafo();
      cerrarLista();
    } else {
      cerrarLista();
      parrafo.push(linea);
    }
  }
  cerrarParrafo();
  cerrarLista();

  return <div className={cn('flex flex-col gap-2 break-words', className)}>{bloques}</div>;
}
