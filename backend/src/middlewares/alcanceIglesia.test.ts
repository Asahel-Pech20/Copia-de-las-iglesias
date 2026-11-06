import express, { Router } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { crearIglesia, loginComo } from '../test/helpers';
import { alcanceIglesia, evaluarAlcance, iglesiaDeLaRuta } from './alcanceIglesia';
import { autenticar } from './auth';
import { manejarErrores } from './errores';

// Mini-aplicación con la forma de las rutas de Ecclesia: /iglesias/:iglesiaId/...
const rutas = Router({ mergeParams: true });
rutas.get('/ping', (_req, res) => {
  res.json({ data: 'ok' });
});
const app = express()
  .use('/iglesias/:iglesiaId', autenticar, alcanceIglesia(iglesiaDeLaRuta), rutas)
  .use(manejarErrores);

describe('regla pura del alcance por iglesia (ADR-0004)', () => {
  it('permite entrar a la propia iglesia', () => {
    expect(evaluarAlcance('a', 'a')).toBe('PERMITIDO');
  });

  it('prohíbe entrar a otra iglesia', () => {
    expect(evaluarAlcance('a', 'b')).toBe('PROHIBIDO');
  });

  it('la Coordinación (sin iglesia) tampoco entra a los datos internos de una iglesia', () => {
    expect(evaluarAlcance(null, 'a')).toBe('PROHIBIDO');
  });

  it('un recurso que no existe es NO_EXISTE, venga quien venga', () => {
    expect(evaluarAlcance('a', undefined)).toBe('NO_EXISTE');
    expect(evaluarAlcance('a', null)).toBe('NO_EXISTE');
    expect(evaluarAlcance(null, undefined)).toBe('NO_EXISTE');
  });
});

describe('alcanceIglesia en una ruta /iglesias/:iglesiaId (RNF-10)', () => {
  it('el personal entra a su propia iglesia', async () => {
    const iglesia = await crearIglesia();
    const { auth } = await loginComo('TESORERO', { iglesiaId: iglesia.id });
    const res = await request(app).get(`/iglesias/${iglesia.id}/ping`).set('Authorization', auth);
    expect(res.status).toBe(200);
  });

  it('el personal de otra iglesia recibe 403', async () => {
    const [propia, ajena] = [await crearIglesia(), await crearIglesia()];
    const { auth } = await loginComo('ADMIN_IGLESIA', { iglesiaId: propia.id });
    const res = await request(app).get(`/iglesias/${ajena.id}/ping`).set('Authorization', auth);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('la Coordinación recibe 403 en los datos internos de una iglesia', async () => {
    const iglesia = await crearIglesia();
    const { auth } = await loginComo('COORDINACION');
    const res = await request(app).get(`/iglesias/${iglesia.id}/ping`).set('Authorization', auth);
    expect(res.status).toBe(403);
  });

  it('una iglesia que no existe responde 404', async () => {
    const { auth } = await loginComo('TESORERO');
    const res = await request(app).get('/iglesias/no-existe/ping').set('Authorization', auth);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('sin sesión responde 401', async () => {
    const iglesia = await crearIglesia();
    const res = await request(app).get(`/iglesias/${iglesia.id}/ping`);
    expect(res.status).toBe(401);
  });

  it('lee la iglesia de la BD: el usuario trasladado a otra iglesia pierde el acceso con su token viejo', async () => {
    const [antes, despues] = [await crearIglesia(), await crearIglesia()];
    const { auth, usuario } = await loginComo('TESORERO', { iglesiaId: antes.id });
    const { prisma } = await import('../lib/prisma');
    await prisma.usuario.update({ where: { id: usuario.id }, data: { iglesiaId: despues.id } });
    const res = await request(app).get(`/iglesias/${antes.id}/ping`).set('Authorization', auth);
    expect(res.status).toBe(403);
  });
});
