import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { msw } from 'msw/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // msw en modo worker-only: sirve mockServiceWorker.js en desarrollo (src/mocks/browser.ts)
  plugins: [react(), tailwindcss(), msw({ mode: 'worker-only' })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    env: { VITE_API_URL: 'http://localhost:3000/api/v1', VITE_USE_MOCKS: 'false' },
  },
});
