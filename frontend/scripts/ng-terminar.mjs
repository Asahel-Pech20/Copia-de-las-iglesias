// Ejecuta `ng build` / `ng test` y termina el proceso cuando Angular reporta el resultado.
// Motivo: con Angular 21.2 el proceso de esbuild queda abierto al terminar y `ng` nunca sale,
// así que el CI esperaba indefinidamente. El código de salida refleja el resultado real.
// Uso: node scripts/ng-terminar.mjs build | node scripts/ng-terminar.mjs test --watch=false
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ng = require.resolve('@angular/cli/bin/ng.js');
const args = process.argv.slice(2);
const esPrueba = args[0] === 'test';

// Líneas que Angular imprime al terminar (sin colores ANSI)
const EXITO = esPrueba ? /Tests\s+\d+ passed/ : /Application bundle generation complete/;
const FALLO = esPrueba
  ? /Tests\s+.*\d+ failed|Test Files\s+.*\d+ failed/
  : /Application bundle generation failed/;
const FIN = esPrueba ? /Duration\s+/ : /Application bundle generation (complete|failed)/;

const hijo = spawn(process.execPath, [ng, ...args], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NG_CLI_ANALYTICS: 'false', FORCE_COLOR: '0' },
});

let salida = '';
let terminado = false;

// Códigos de color ANSI (ESC[…m)
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

function revisar(fragmento) {
  salida += fragmento.replace(ANSI, '');
  if (terminado || !FIN.test(salida)) return;
  terminado = true;
  const codigo = FALLO.test(salida) || !EXITO.test(salida) ? 1 : 0;
  // Margen para que se impriman las últimas líneas (p. ej. avisos de presupuesto del build)
  setTimeout(() => {
    hijo.kill();
    process.exit(codigo);
  }, 1500);
}

for (const flujo of [hijo.stdout, hijo.stderr]) {
  flujo.on('data', (d) => {
    process[flujo === hijo.stdout ? 'stdout' : 'stderr'].write(d);
    revisar(String(d));
  });
}

hijo.on('exit', (codigo) => {
  if (!terminado) process.exit(codigo ?? 1);
});
