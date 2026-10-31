import { defineConfig } from 'vitest/config';

const BD_PRUEBAS = 'postgresql://iglesia:iglesia@localhost:5433/iglesia_test';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    // Todas las suites comparten la misma BD de pruebas: se ejecutan una tras otra
    fileParallelism: false,
    // Variables fijas para pruebas: nunca se usa la BD de desarrollo
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL_TEST ?? BD_PRUEBAS,
      DATABASE_URL_TEST: process.env.DATABASE_URL_TEST ?? BD_PRUEBAS,
      JWT_ACCESS_SECRET: 'secreto-access-pruebas',
      JWT_REFRESH_SECRET: 'secreto-refresh-pruebas',
      FRONTEND_URL: 'http://localhost:5173',
      API_PUBLIC_URL: 'http://localhost:3000',
      UPLOAD_DIR: 'uploads-test',
      BCRYPT_COST: '4',
    },
  },
});
