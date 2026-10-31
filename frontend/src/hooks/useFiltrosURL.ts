import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

type ValorFiltro = string | number | boolean | undefined;

/**
 * Sincroniza filtros con la query string (?q=&estado=&page=), así se pueden compartir y recargar.
 * Los valores por defecto no se escriben en la URL. Al cambiar cualquier filtro distinto de `page`, vuelve a la página 1.
 * @example
 * const [filtros, setFiltros] = useFiltrosURL({ q: '', estado: 'activo', page: 1 });
 * setFiltros({ q: 'ana' });
 */
export function useFiltrosURL<T extends Record<string, ValorFiltro>>(porDefecto: T) {
  const [params, setParams] = useSearchParams();
  const claveDefecto = JSON.stringify(porDefecto);

  const filtros = useMemo(() => {
    const base = JSON.parse(claveDefecto) as T;
    const resultado: Record<string, ValorFiltro> = { ...base };
    for (const [clave, def] of Object.entries(base)) {
      const crudo = params.get(clave);
      if (crudo === null) continue;
      resultado[clave] =
        typeof def === 'number'
          ? Number(crudo) || def
          : typeof def === 'boolean'
            ? crudo === 'true'
            : crudo;
    }
    return resultado as T;
  }, [params, claveDefecto]);

  const setFiltros = useCallback(
    (cambios: Partial<T>) => {
      setParams(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales);
          const base = JSON.parse(claveDefecto) as T;
          for (const [clave, valor] of Object.entries(cambios)) {
            if (valor === undefined || valor === '' || valor === base[clave])
              siguientes.delete(clave);
            else siguientes.set(clave, String(valor));
          }
          if (!('page' in cambios)) siguientes.delete('page');
          return siguientes;
        },
        { replace: true },
      );
    },
    [setParams, claveDefecto],
  );

  return [filtros, setFiltros] as const;
}
