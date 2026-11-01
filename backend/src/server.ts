import { crearApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

const app = crearApp();

app.listen(env.PORT, () => {
  logger.info(`API escuchando en http://localhost:${env.PORT}/api/v1`);
});
