import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Variables fijas para pruebas: nunca se usa la BD de desarrollo
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://iglesia:iglesia@localhost:5433/iglesia_test',
      DATABASE_URL_TEST: 'postgresql://iglesia:iglesia@localhost:5433/iglesia_test',
      JWT_ACCESS_SECRET: 'secreto-access-pruebas',
      JWT_REFRESH_SECRET: 'secreto-refresh-pruebas',
      FRONTEND_URL: 'http://localhost:5173',
      UPLOAD_DIR: 'uploads-test',
    },
  },
});
