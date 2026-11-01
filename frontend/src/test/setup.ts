import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { guardarToken } from '@/lib/api';
import { reiniciarDb } from '@/mocks/db';
import { server } from '@/mocks/server';

// Radix usa estas APIs del navegador que jsdom no implementa (no aplica a pruebas en entorno node)
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView ??= () => {};
  window.HTMLElement.prototype.hasPointerCapture ??= () => false;
  window.HTMLElement.prototype.releasePointerCapture ??= () => {};
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  if (typeof window !== 'undefined') cleanup();
  server.resetHandlers();
  reiniciarDb();
  guardarToken(null);
});

afterAll(() => server.close());
