import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { ruta } from '@/mocks/utils';
import { api, guardarToken, normalizarError, obtenerToken, registrarAlExpirarSesion } from './api';

describe('cliente API', () => {
  it('handler de ejemplo de MSW responde en pruebas', async () => {
    const res = await api.get('/health');
    expect(res.data).toEqual({ data: { status: 'ok' } });
  });

  it('agrega el Bearer del token en memoria', async () => {
    let cabecera: string | null = null;
    server.use(
      http.get(ruta('/eco'), ({ request }) => {
        cabecera = request.headers.get('Authorization');
        return HttpResponse.json({ data: null });
      }),
    );
    guardarToken('abc');
    await api.get('/eco');
    expect(cabecera).toBe('Bearer abc');
  });

  it('dos peticiones simultáneas con token expirado provocan UN solo refresh', async () => {
    let refrescos = 0;
    server.use(
      http.post(ruta('/auth/refresh'), async () => {
        refrescos++;
        await new Promise((r) => setTimeout(r, 20));
        return HttpResponse.json({ data: { accessToken: 'nuevo' } });
      }),
      http.get(ruta('/protegido/:n'), ({ request, params }) => {
        if (request.headers.get('Authorization') !== 'Bearer nuevo') {
          return HttpResponse.json(
            { error: { code: 'TOKEN_EXPIRED', message: 'La sesión expiró.' } },
            { status: 401 },
          );
        }
        return HttpResponse.json({ data: params.n });
      }),
    );
    guardarToken('viejo');

    const [a, b] = await Promise.all([api.get('/protegido/1'), api.get('/protegido/2')]);

    expect(refrescos).toBe(1);
    expect([a.data.data, b.data.data]).toEqual(['1', '2']);
    expect(obtenerToken()).toBe('nuevo');
  });

  it('si el refresh falla, borra el token y avisa para cerrar sesión', async () => {
    const alExpirar = vi.fn();
    registrarAlExpirarSesion(alExpirar);
    server.use(
      http.post(ruta('/auth/refresh'), () =>
        HttpResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'x' } }, { status: 401 }),
      ),
      http.get(ruta('/protegido'), () =>
        HttpResponse.json({ error: { code: 'TOKEN_EXPIRED', message: 'x' } }, { status: 401 }),
      ),
    );
    guardarToken('viejo');

    await expect(api.get('/protegido')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(obtenerToken()).toBeNull();
    expect(alExpirar).toHaveBeenCalledOnce();
    registrarAlExpirarSesion(null);
  });

  it('normaliza errores del contrato a ErrorApi', async () => {
    server.use(
      http.get(ruta('/conflicto'), () =>
        HttpResponse.json(
          { error: { code: 'CONFLICT', message: 'El correo ya está registrado.' } },
          { status: 409 },
        ),
      ),
    );
    await expect(api.get('/conflicto')).rejects.toEqual({
      status: 409,
      code: 'CONFLICT',
      message: 'El correo ya está registrado.',
    });
  });

  it('normaliza errores de red', async () => {
    server.use(http.get(ruta('/caido'), () => HttpResponse.error()));
    await expect(api.get('/caido')).rejects.toMatchObject({ code: 'NETWORK_ERROR', status: 0 });
  });

  it('normalizarError tolera valores desconocidos', () => {
    expect(normalizarError('raro')).toMatchObject({ code: 'INTERNAL_ERROR' });
  });
});
