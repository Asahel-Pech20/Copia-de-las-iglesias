import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Servidor de mocks para Vitest (se activa en src/test/setup.ts)
export const server = setupServer(...handlers);
