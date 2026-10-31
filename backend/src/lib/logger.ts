import pino from 'pino';
import { env } from '../config/env';

// Nunca registrar contraseñas, tokens ni cookies (AGENTS.md regla 5)
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordActual',
      '*.passwordNueva',
      '*.passwordHash',
      '*.token',
      '*.refreshToken',
    ],
    censor: '[oculto]',
  },
  transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
});
