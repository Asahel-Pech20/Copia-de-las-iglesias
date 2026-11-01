import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { crearApp } from './app';

describe('GET /api/v1/health', () => {
  it('responde status ok', async () => {
    const res = await request(crearApp()).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: 'ok' } });
  });

  it('incluye cabeceras de seguridad y CORS con credenciales', async () => {
    const res = await request(crearApp())
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
