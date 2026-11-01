// Hook PostToolUse: formatea con Prettier cada archivo que el agente edita.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Los .md no se formatean para no reescribir las tablas de la documentación
const FORMATEABLES = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.yml',
  '.yaml',
  '.css',
  '.html',
]);

// En Windows, Git Bash puede entregar rutas como /c/Users/...; Node necesita C:/Users/...
const normalizar = (ruta) =>
  ruta && process.platform === 'win32' && /^\/[a-z]\//i.test(ruta)
    ? `${ruta[1]}:${ruta.slice(2)}`
    : ruta;

const entrada = JSON.parse(readFileSync(0, 'utf8') || '{}');
const archivo = normalizar(entrada.tool_input?.file_path);
const raiz = normalizar(process.env.CLAUDE_PROJECT_DIR) ?? process.cwd();

if (!archivo || !existsSync(archivo) || !FORMATEABLES.has(path.extname(archivo))) process.exit(0);
// Solo archivos del proyecto, nunca node_modules
const relativo = path.relative(raiz, archivo);
if (relativo.startsWith('..') || relativo.includes('node_modules')) process.exit(0);

const prettier = path.join(raiz, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
if (!existsSync(prettier)) process.exit(0); // aún no se instalaron dependencias

try {
  execFileSync(process.execPath, [prettier, '--write', '--log-level', 'warn', archivo], {
    cwd: raiz,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
} catch (err) {
  // No bloquea: avisa al agente para que revise la sintaxis
  console.error(`Prettier no pudo formatear ${relativo}: ${err.stderr?.toString() ?? err.message}`);
}
