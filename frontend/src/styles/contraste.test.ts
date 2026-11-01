// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Verifica WCAG 2.1 AA (≥ 4.5:1) en los pares texto/fondo principales, leyendo los tokens de index.css
const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8');

function tokens(selector: string): Record<string, string> {
  const bloque =
    css.match(new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
  return Object.fromEntries(
    [...bloque.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]),
  );
}

function luminancia(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

const PARES: [string, string][] = [
  ['texto', 'fondo'],
  ['texto', 'superficie'],
  ['texto-suave', 'fondo'],
  ['texto-suave', 'superficie'],
  ['primario', 'fondo'],
  ['primario', 'superficie'],
  ['primario-texto', 'primario'],
  ['acento-texto', 'acento'],
  ['peligro', 'superficie'],
  ['peligro-texto', 'peligro'],
  ['exito', 'superficie'],
  ['alerta', 'superficie'],
];

describe.each([
  ['claro', ':root'],
  ['oscuro', '.dark'],
])('contraste AA en modo %s', (_modo, selector) => {
  const t = tokens(selector);
  it.each(PARES)('%s sobre %s ≥ 4.5', (texto, fondo) => {
    expect(t[texto], `falta --${texto}`).toBeDefined();
    expect(t[fondo], `falta --${fondo}`).toBeDefined();
    expect(contraste(t[texto]!, t[fondo]!)).toBeGreaterThanOrEqual(4.5);
  });
});
