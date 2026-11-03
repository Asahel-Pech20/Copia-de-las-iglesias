import { screen, waitFor, within } from '@testing-library/react';
import { http } from 'msw';
import { describe, expect, it } from 'vitest';
import { construirDashboard } from '@/mocks/handlers/dashboard';
import { server } from '@/mocks/server';
import { errorApi, ruta } from '@/mocks/utils';
import { renderApp } from '@/test/renderApp';

const indicadores = () => screen.findByRole('region', { name: 'Indicadores' });

describe('indicadores del dashboard (F4-06)', () => {
  it('saluda al usuario y muestra los indicadores con enlace a su módulo', async () => {
    await renderApp('/', { como: 'u-pastor' });
    expect(
      await screen.findByRole('heading', {
        name: /(Buenos días|Buenas tardes|Buenas noches), Pastor Daniel Ruiz/,
      }),
    ).toBeInTheDocument();
    const region = await indicadores();
    await within(region).findByText('Miembros activos');
    expect(within(region).getByRole('link', { name: /Miembros activos/ })).toHaveAttribute(
      'href',
      '/miembros',
    );
    expect(within(region).getByText(/Esta semana:/)).toBeInTheDocument();
    expect(within(region).getByText('Ministerios')).toBeInTheDocument();
  });

  it('con ingresos: la tarjeta muestra el total del mes y la variación', async () => {
    await renderApp('/', { como: 'u-tesorero' });
    const region = await indicadores();
    expect(await within(region).findByText('Ingresos del mes')).toBeInTheDocument();
    expect(within(region).getByText('$4,620.50')).toBeInTheDocument();
    expect(within(region).getByText(/\+20\.0 % vs\. mes anterior/)).toBeInTheDocument();
    expect(within(region).getByRole('link', { name: /Ingresos del mes/ })).toHaveAttribute(
      'href',
      '/donaciones',
    );
  });

  it('SECRETARIO no ve ingresos: ni tarjeta, ni gráfica, ni hueco', async () => {
    let respuesta: unknown;
    server.events.on('response:mocked', async ({ response, request }) => {
      if (new URL(request.url).pathname.endsWith('/dashboard')) {
        respuesta = await response.clone().json();
      }
    });
    await renderApp('/', { como: 'u-secretario' });
    const region = await indicadores();
    await within(region).findByText('Miembros activos');
    await screen.findByRole('heading', { name: 'Asistencia semanal' });

    // El contrato: la clave se omite (no es null ni 0)
    await waitFor(() => expect(respuesta).toBeDefined());
    expect(respuesta).toHaveProperty('data.miembrosActivos');
    expect(respuesta).not.toHaveProperty('data.ingresos');

    expect(screen.queryByText('Ingresos del mes')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ingresos por mes' })).not.toBeInTheDocument();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    expect(within(region).getAllByRole('link')).toHaveLength(3); // sin hueco: 3 tarjetas
    server.events.removeAllListeners();
  });

  it('COORDINADOR tampoco ve ingresos', async () => {
    await renderApp('/', { como: 'u-coordinador' });
    await indicadores();
    await screen.findByRole('heading', { name: 'Asistencia semanal' });
    expect(screen.queryByText('Ingresos del mes')).not.toBeInTheDocument();
  });

  it('el simulador omite `ingresos` sin donaciones:leer y lo incluye con permiso', () => {
    expect('ingresos' in construirDashboard(false)).toBe(false);
    expect(construirDashboard(true).ingresos?.porMes).toHaveLength(12);
  });

  it('muestra esqueletos mientras carga', async () => {
    const { container } = await renderApp('/', { como: 'u-admin' });
    // La primera pintura ocurre antes de que responda el servidor simulado
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    await screen.findByText('Miembros activos');
  });

  it('muestra el error del servidor con botón Reintentar', async () => {
    server.use(
      http.get(ruta('/dashboard'), () => errorApi(500, 'INTERNAL_ERROR', 'Falló el servidor.')),
    );
    await renderApp('/', { como: 'u-admin' });
    expect(await screen.findByText('Falló el servidor.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
  });
});

describe('gráficas del dashboard (F4-07)', () => {
  it('cada gráfica tiene título, descripción y se puede ver como tabla', async () => {
    const { usuario } = await renderApp('/', { como: 'u-admin' });
    await screen.findByRole('heading', { name: 'Miembros por ministerio' });
    for (const titulo of [
      'Asistencia semanal',
      'Miembros por ministerio',
      'Altas de miembros por mes',
      'Ingresos por mes',
    ]) {
      expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument();
    }
    expect(screen.getByText(/Presentes por semana en las últimas 12 semanas/)).toBeInTheDocument();

    await usuario.click(
      screen.getByRole('button', { name: 'Ver como tabla: Miembros por ministerio' }),
    );
    const tabla = await screen.findByRole('table', { name: 'Datos de Miembros por ministerio' });
    expect(within(tabla).getByText('Jóvenes')).toBeInTheDocument();
    // vuelve a la gráfica
    await usuario.click(
      screen.getByRole('button', { name: 'Ver como gráfica: Miembros por ministerio' }),
    );
    expect(screen.queryByRole('table', { name: 'Datos de Miembros por ministerio' })).toBeNull();
  });

  it('la tabla de ingresos usa la moneda configurada', async () => {
    const { usuario } = await renderApp('/', { como: 'u-tesorero' });
    await usuario.click(
      await screen.findByRole('button', { name: 'Ver como tabla: Ingresos por mes' }),
    );
    const tabla = await screen.findByRole('table', { name: 'Datos de Ingresos por mes' });
    expect(within(tabla).getAllByText(/^\$/).length).toBe(12);
  });
});

describe('eventos y avisos (F4-08)', () => {
  it('lista los próximos eventos y los avisos importantes con "Ver todos"', async () => {
    await renderApp('/', { como: 'u-secretario' });
    const eventos = await screen.findByRole('list', { name: 'Próximos eventos' });
    expect(within(eventos).getAllByRole('listitem').length).toBeGreaterThan(0);
    expect(await screen.findByText('Semana de ayuno y oración')).toBeInTheDocument();
    const enlaces = screen.getAllByRole('link', { name: 'Ver todos' });
    expect(enlaces.map((e) => e.getAttribute('href'))).toEqual(['/eventos', '/anuncios']);
  });
});
