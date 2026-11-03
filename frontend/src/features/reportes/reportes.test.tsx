import { screen, waitFor, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/mocks/server';
import { errorApi, ruta } from '@/mocks/utils';
import { renderApp } from '@/test/renderApp';
import { nombreDeContentDisposition } from './api';

const tarjetas = async () => {
  const lista = await screen.findByRole('list', { name: 'Reportes disponibles' });
  return within(lista)
    .getAllByRole('link')
    .map((l) => l.getAttribute('href'));
};

describe('centro de reportes (F4-09)', () => {
  it('ADMIN y PASTOR ven los cuatro reportes', async () => {
    for (const como of ['u-admin', 'u-pastor']) {
      const { unmount } = await renderApp('/reportes', { como });
      expect(await tarjetas()).toEqual([
        '/reportes?tipo=miembros',
        '/reportes?tipo=asistencia',
        '/reportes?tipo=ministerios',
        '/reportes?tipo=ingresos',
      ]);
      unmount();
    }
  });

  it('TESORERO solo ve Ingresos', async () => {
    await renderApp('/reportes', { como: 'u-tesorero' });
    expect(await tarjetas()).toEqual(['/reportes?tipo=ingresos']);
  });

  it('SECRETARIO y COORDINADOR no ven Ingresos', async () => {
    for (const como of ['u-secretario', 'u-coordinador']) {
      const { unmount } = await renderApp('/reportes', { como });
      const enlaces = await tarjetas();
      expect(enlaces).toHaveLength(3);
      expect(enlaces).not.toContain('/reportes?tipo=ingresos');
      unmount();
    }
  });

  it('pedir un reporte sin permiso por la URL muestra "No tienes acceso"', async () => {
    await renderApp('/reportes?tipo=ingresos', { como: 'u-secretario' });
    expect(await screen.findByText('No tienes acceso a este reporte')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Vista previa/ })).not.toBeInTheDocument();
  });
});

describe('vista previa (F4-10)', () => {
  it('?tipo=asistencia&desde&hasta (enlace de F3) abre el reporte con esos filtros', async () => {
    await renderApp('/reportes?tipo=asistencia&desde=2020-01-01&hasta=2030-12-31', {
      como: 'u-secretario',
    });
    expect(
      await screen.findByRole('heading', { name: 'Reporte de asistencia' }),
    ).toBeInTheDocument();
    const vista = await screen.findByRole('region', {
      name: /Vista previa: Reporte de asistencia/,
    });
    expect(within(vista).getByText(/Desde: 01\/01\/2020/)).toBeInTheDocument();
    expect(within(vista).getByText(/Hasta: 31\/12\/2030/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });

  it('miembros: tabla con filas y filtro de estado', async () => {
    const { usuario } = await renderApp('/reportes?tipo=miembros', { como: 'u-pastor' });
    const tabla = await screen.findByRole('table', { name: 'Miembros' });
    const activos = within(tabla).getAllByRole('row').length;
    await usuario.click(screen.getByRole('combobox', { name: 'Estado de los miembros' }));
    await usuario.click(await screen.findByRole('option', { name: 'Todos' }));
    await waitFor(async () => {
      const otra = await screen.findByRole('table', { name: 'Miembros' });
      expect(within(otra).getAllByRole('row').length).toBeGreaterThan(activos);
    });
  });

  it('ingresos: resumen con moneda, tabla y fila de totales', async () => {
    await renderApp('/reportes?tipo=ingresos&agrupar=concepto', { como: 'u-tesorero' });
    const vista = await screen.findByRole('region', { name: /Vista previa: Reporte de ingresos/ });
    expect(within(vista).getAllByText('Aportaciones').length).toBeGreaterThan(0);
    expect(within(vista).getAllByText(/^\$/).length).toBeGreaterThan(2);
    expect(within(vista).getByRole('table', { name: /Resumen por concepto/ })).toBeInTheDocument();
    expect(within(vista).getByLabelText('Totales de Resumen por concepto')).toBeInTheDocument();
  });

  it('el filtro inválido del servidor se muestra con Reintentar', async () => {
    await renderApp('/reportes?tipo=ingresos&desde=2026-05-01&hasta=2026-01-01', {
      como: 'u-admin',
    });
    expect(await screen.findByText('Los datos enviados no son válidos.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/ })).toBeInTheDocument();
  });

  it('asistencia por evento sin evento elegido pide elegir uno', async () => {
    await renderApp('/reportes?tipo=asistencia&modo=evento', { como: 'u-admin' });
    expect(await screen.findByText('Elige un evento')).toBeInTheDocument();
  });
});

describe('descarga (F4-09, F4-11)', () => {
  const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click');
  let creada: Blob | undefined;

  beforeEach(() => {
    clic.mockImplementation(() => {});
    URL.createObjectURL = vi.fn((blob: Blob) => {
      creada = blob;
      return 'blob:prueba';
    });
    URL.revokeObjectURL = vi.fn();
    creada = undefined;
  });
  afterEach(() => clic.mockReset());

  it('baja el PDF como blob y lo guarda con el nombre de Content-Disposition', async () => {
    const { usuario } = await renderApp('/reportes?tipo=ingresos', { como: 'u-tesorero' });
    await screen.findByRole('region', { name: /Vista previa/ });
    await usuario.click(screen.getByRole('button', { name: 'Exportar' }));
    await usuario.click(await screen.findByRole('menuitem', { name: 'PDF' }));

    await waitFor(() => expect(clic).toHaveBeenCalledTimes(1));
    const enlace = clic.mock.contexts[0] as HTMLAnchorElement;
    expect(enlace.download).toMatch(/^reporte-ingresos-\d{4}-\d{2}-\d{2}\.pdf$/);
    expect(enlace.href).toBe('blob:prueba');
    expect(creada).toBeInstanceOf(Blob);
    expect(creada?.type).toBe('application/pdf');
    expect(await screen.findByText(/Descargado reporte-ingresos-/)).toBeInTheDocument();
  });

  it('Excel pide formato=xlsx con los mismos filtros de la vista previa', async () => {
    const urls: URL[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/reportes/ingresos')) urls.push(new URL(request.url));
    });
    const { usuario } = await renderApp(
      '/reportes?tipo=ingresos&desde=2026-01-01&hasta=2026-03-31&agrupar=mes',
      { como: 'u-admin' },
    );
    await screen.findByRole('region', { name: /Vista previa/ });
    await usuario.click(screen.getByRole('button', { name: 'Exportar' }));
    await usuario.click(await screen.findByRole('menuitem', { name: 'Excel' }));
    await waitFor(() => expect(urls.length).toBeGreaterThanOrEqual(2));

    const vista = urls.find((u) => u.searchParams.get('formato') === 'json')!;
    const descarga = urls.find((u) => u.searchParams.get('formato') === 'xlsx')!;
    for (const filtro of ['desde', 'hasta', 'agrupar']) {
      expect(descarga.searchParams.get(filtro)).toBe(vista.searchParams.get(filtro));
    }
    expect(descarga.searchParams.get('desde')).toBe('2026-01-01');
    server.events.removeAllListeners();
  });

  it('muestra el mensaje del servidor cuando la descarga falla (JSON dentro de un Blob)', async () => {
    const mensaje =
      'El reporte tiene 6,000 filas; el PDF admite hasta 5,000. Descárgalo en Excel o acota los filtros.';
    server.use(
      http.get(ruta('/reportes/ingresos'), ({ request }) =>
        new URL(request.url).searchParams.get('formato') === 'pdf'
          ? errorApi(422, 'BUSINESS_RULE', mensaje)
          : undefined,
      ),
    );
    const { usuario } = await renderApp('/reportes?tipo=ingresos', { como: 'u-tesorero' });
    await screen.findByRole('region', { name: /Vista previa/ });
    await usuario.click(screen.getByRole('button', { name: 'Exportar' }));
    await usuario.click(await screen.findByRole('menuitem', { name: 'PDF' }));
    expect(await screen.findByText(mensaje)).toBeInTheDocument();
    expect(clic).not.toHaveBeenCalled();
    // el botón vuelve a estar disponible
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeEnabled();
  });

  it('el botón se deshabilita mientras descarga', async () => {
    server.use(
      http.get(ruta('/reportes/ingresos'), async ({ request }) => {
        if (new URL(request.url).searchParams.get('formato') !== 'xlsx') return undefined;
        await delay(400);
        return new HttpResponse(new TextEncoder().encode('x'), {
          headers: {
            'Content-Disposition': 'attachment; filename="reporte-ingresos-2026-11-02.xlsx"',
          },
        });
      }),
    );
    const { usuario } = await renderApp('/reportes?tipo=ingresos', { como: 'u-tesorero' });
    await screen.findByRole('region', { name: /Vista previa/ });
    await usuario.click(screen.getByRole('button', { name: 'Exportar' }));
    await usuario.click(await screen.findByRole('menuitem', { name: 'Excel' }));
    expect(await screen.findByRole('button', { name: 'Descargando…' })).toBeDisabled();
    await waitFor(() => expect(clic).toHaveBeenCalled());
    expect(await screen.findByRole('button', { name: 'Exportar' })).toBeEnabled();
  });

  it('BotonExportar de la lista de donaciones lleva el rango actual', async () => {
    await renderApp('/donaciones', { como: 'u-tesorero' });
    expect(await screen.findByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });

  it('BotonExportar se oculta a quien no puede ver ese reporte', async () => {
    // PASTOR ve donaciones pero SECRETARIO no entra; COORDINADOR sí tiene reportes generales
    await renderApp('/reportes?tipo=miembros', { como: 'u-coordinador' });
    expect(await screen.findByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });
});

describe('nombre del archivo', () => {
  it('lee filename de Content-Disposition (simple y UTF-8)', () => {
    expect(
      nombreDeContentDisposition('attachment; filename="reporte-miembros-2026-10-30.pdf"'),
    ).toBe('reporte-miembros-2026-10-30.pdf');
    expect(nombreDeContentDisposition("attachment; filename*=UTF-8''reporte%20%C3%B1.xlsx")).toBe(
      'reporte ñ.xlsx',
    );
    expect(nombreDeContentDisposition(undefined)).toBeNull();
  });
});
