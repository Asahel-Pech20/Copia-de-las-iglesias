import { inject, Injectable } from '@angular/core';
import { Api } from '@/app/core/api';
import type { Anuncio, Cartelera, GuardarAnuncio, QueryAnuncios } from '@/app/tipos/anuncios';

/** Servicio de anuncios (F3). El dashboard (F4) usa `listar({ vigentes: true })` y la tarjeta compacta. */
@Injectable({ providedIn: 'root' })
export class AnunciosService {
  private readonly api = inject(Api);

  listar(query: QueryAnuncios) {
    return this.api.lista<Anuncio>('/anuncios', { ...query });
  }

  crear(datos: GuardarAnuncio) {
    return this.api.post<Anuncio>('/anuncios', datos);
  }

  editar(id: string, datos: Partial<GuardarAnuncio>) {
    return this.api.patch<Anuncio>(`/anuncios/${id}`, datos);
  }

  eliminar(id: string) {
    return this.api.delete(`/anuncios/${id}`);
  }

  /** Cartelera pública (sin sesión). */
  cartelera() {
    return this.api.objeto<Cartelera>('/public/cartelera');
  }
}
