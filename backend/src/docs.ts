import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

/** Swagger UI en /api/docs, alimentado por backend/openapi.yaml (cada dueño agrega sus rutas). */
export function montarDocumentacion(app: Express) {
  const especificacion = parse(readFileSync(path.resolve('openapi.yaml'), 'utf8')) as object;
  app.get('/api/docs/openapi.json', (_req, res) => {
    res.json(especificacion);
  });
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(especificacion, { customSiteTitle: 'AppIglesia API' }),
  );
}
