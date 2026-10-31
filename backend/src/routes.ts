import { Router } from 'express';

// Router raíz de la API: cada módulo monta aquí sus rutas
export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});
