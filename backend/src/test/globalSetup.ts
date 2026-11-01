import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Antes de todas las pruebas: aplica las migraciones a la BD de pruebas (postgres-test, puerto 5433)
export default function setup() {
  const url =
    process.env.DATABASE_URL_TEST ?? 'postgresql://iglesia:iglesia@localhost:5433/iglesia_test';
  execFileSync(
    process.execPath,
    [path.resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
    { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' },
  );
}
