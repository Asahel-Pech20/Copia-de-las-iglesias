// Hook Stop: antes de que el agente dé por terminada su respuesta, corre lint y typecheck.
// Si fallan, sale con código 2 y el agente recibe los errores para corregirlos (AGENTS.md §6).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// En Windows, Git Bash puede entregar rutas como /c/Users/...; Node necesita C:/Users/...
const normalizar = (ruta) =>
  ruta && process.platform === 'win32' && /^\/[a-z]\//i.test(ruta)
    ? `${ruta[1]}:${ruta.slice(2)}`
    : ruta;

const entrada = JSON.parse(readFileSync(0, 'utf8') || '{}');
const raiz = normalizar(process.env.CLAUDE_PROJECT_DIR) ?? process.cwd();

// Evita ciclos: si ya se le pidió corregir una vez, no se vuelve a bloquear
if (entrada.stop_hook_active) process.exit(0);
if (!existsSync(path.join(raiz, 'node_modules'))) process.exit(0);

// Solo verifica si hay cambios sin confirmar en código
const git = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd: raiz, encoding: 'utf8' });
const hayCambios = git.stdout
  ?.split('\n')
  .some((linea) => /\.(ts|tsx|js|mjs|cjs|json)$/.test(linea.trim()));
if (!hayCambios) process.exit(0);

// shell: true para que Windows encuentre pnpm.cmd / corepack.cmd
const correr = (cmd) => spawnSync(cmd, { cwd: raiz, encoding: 'utf8', shell: true });
// Si pnpm no está instalado globalmente, se usa el de corepack (incluido con Node)
const pnpm = correr('pnpm --version').status === 0 ? 'pnpm' : 'corepack pnpm';

// typecheck con -r directo: el script raíz llama a "pnpm" y fallaría sin pnpm global
for (const [nombre, cmd] of [
  ['lint', `${pnpm} -s lint`],
  ['typecheck', `${pnpm} -s -r typecheck`],
]) {
  const r = correr(cmd);
  if (r.status !== 0) {
    console.error(`"pnpm ${nombre}" falló. Corrige estos errores antes de terminar:\n`);
    console.error((r.stdout + r.stderr).slice(-4000));
    process.exit(2);
  }
}
