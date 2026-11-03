import { Injectable, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro' | 'sistema';

const CLAVE = 'appiglesia:tema';

function leerTema(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'claro' || guardado === 'oscuro' || guardado === 'sistema') return guardado;
  } catch {
    // almacenamiento no disponible
  }
  return 'sistema';
}

function prefiereOscuro() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/** Tema de la interfaz: respeta la preferencia del sistema hasta que el usuario elige uno. */
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(leerTema());

  constructor() {
    this.aplicar();
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
      if (this.tema() === 'sistema') this.aplicar();
    });
  }

  cambiar(nuevo: Tema) {
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // almacenamiento no disponible
    }
    this.tema.set(nuevo);
    this.aplicar();
  }

  alternar() {
    this.cambiar(document.documentElement.classList.contains('dark') ? 'claro' : 'oscuro');
  }

  private aplicar() {
    const tema = this.tema();
    const oscuro = tema === 'oscuro' || (tema === 'sistema' && prefiereOscuro());
    document.documentElement.classList.toggle('dark', oscuro);
  }
}
