import { describe, expect, it } from 'vitest';
import { crearMeta, esquemaPaginacion, ordenar, paginar } from './paginacion';
import { okLista } from './respuesta';

describe('esquemaPaginacion', () => {
  it('aplica valores por defecto', () => {
    expect(esquemaPaginacion.parse({})).toEqual({ page: 1, limit: 20 });
  });

  it('convierte strings de la query a números', () => {
    expect(esquemaPaginacion.parse({ page: '2', limit: '50' })).toMatchObject({
      page: 2,
      limit: 50,
    });
  });

  it('rechaza limit mayor a 100 y orden mal formado', () => {
    expect(esquemaPaginacion.safeParse({ limit: '101' }).success).toBe(false);
    expect(esquemaPaginacion.safeParse({ orden: 'nombre' }).success).toBe(false);
  });
});

describe('paginar', () => {
  it('calcula skip y take', () => {
    expect(paginar({ page: 3, limit: 20 })).toEqual({ page: 3, limit: 20, skip: 40, take: 20 });
  });

  it('acota valores fuera de rango', () => {
    expect(paginar({ page: 0, limit: 500 })).toEqual({ page: 1, limit: 100, skip: 0, take: 100 });
  });
});

describe('crearMeta y okLista', () => {
  it('arma la respuesta de lista del contrato', () => {
    expect(okLista([{ id: '1' }], crearMeta(45, 2, 20))).toEqual({
      data: [{ id: '1' }],
      meta: { page: 2, limit: 20, total: 45, totalPages: 3 },
    });
  });

  it('totalPages es 0 cuando no hay resultados', () => {
    expect(crearMeta(0, 1, 20).totalPages).toBe(0);
  });
});

describe('ordenar', () => {
  const permitidos = ['nombre', 'fechaIngreso'] as const;

  it('usa el orden pedido si el campo está permitido', () => {
    expect(ordenar('nombre:desc', permitidos, { fechaIngreso: 'asc' })).toEqual({
      nombre: 'desc',
    });
  });

  it('usa el orden por defecto si el campo no está permitido', () => {
    expect(ordenar('passwordHash:asc', permitidos, { fechaIngreso: 'asc' })).toEqual({
      fechaIngreso: 'asc',
    });
  });
});
