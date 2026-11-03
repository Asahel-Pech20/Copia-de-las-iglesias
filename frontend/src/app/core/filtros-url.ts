import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

type ValorFiltro = string | number | boolean | undefined;

/**
 * Sincroniza filtros con la query string (?q=&estado=&page=), así se pueden compartir y recargar.
 * Los valores por defecto no se escriben en la URL. Al cambiar cualquier filtro distinto de `page`,
 * vuelve a la página 1. Se llama en el constructor de la página (contexto de inyección).
 * @example
 * readonly filtros = filtrosURL({ q: '', estado: 'activo', page: 1 });
 * this.filtros.cambiar({ q: 'ana' });
 */
export function filtrosURL<T extends Record<string, ValorFiltro>>(porDefecto: T) {
  const ruta = inject(ActivatedRoute);
  const router = inject(Router);
  const params = toSignal(ruta.queryParamMap, { requireSync: true });

  const valores = computed(() => {
    const actuales = params();
    const resultado: Record<string, ValorFiltro> = { ...porDefecto };
    for (const [clave, def] of Object.entries(porDefecto)) {
      const crudo = actuales.get(clave);
      if (crudo === null) continue;
      resultado[clave] =
        typeof def === 'number'
          ? Number(crudo) || def
          : typeof def === 'boolean'
            ? crudo === 'true'
            : crudo;
    }
    return resultado as T;
  });

  function cambiar(cambios: Partial<T>) {
    const siguientes: Record<string, string | null> = {};
    for (const [clave, valor] of Object.entries(cambios)) {
      siguientes[clave] =
        valor === undefined || valor === '' || valor === porDefecto[clave] ? null : String(valor);
    }
    if (!('page' in cambios)) siguientes['page'] = null;
    void router.navigate([], {
      relativeTo: ruta,
      queryParams: siguientes,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  return { valores, cambiar };
}
