import { useCallback, useEffect, useState } from 'react';

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

export function aplicarTema(tema: Tema) {
  const oscuro = tema === 'oscuro' || (tema === 'sistema' && prefiereOscuro());
  document.documentElement.classList.toggle('dark', oscuro);
}

/** Tema de la interfaz: respeta la preferencia del sistema hasta que el usuario elige uno. */
export function useTema() {
  const [tema, setTema] = useState<Tema>(leerTema);

  useEffect(() => {
    aplicarTema(tema);
    if (tema !== 'sistema' || !window.matchMedia) return;
    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = () => aplicarTema('sistema');
    consulta.addEventListener('change', alCambiar);
    return () => consulta.removeEventListener('change', alCambiar);
  }, [tema]);

  const cambiarTema = useCallback((nuevo: Tema) => {
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // almacenamiento no disponible
    }
    setTema(nuevo);
  }, []);

  const alternar = useCallback(() => {
    const oscuroAhora = document.documentElement.classList.contains('dark');
    cambiarTema(oscuroAhora ? 'claro' : 'oscuro');
  }, [cambiarTema]);

  return { tema, cambiarTema, alternar };
}
