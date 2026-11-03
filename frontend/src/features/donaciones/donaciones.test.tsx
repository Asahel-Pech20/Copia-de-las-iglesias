import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Providers } from '@/app/providers';
import { useSesion } from '@/features/auth/contexto';
import { crearQueryClient } from '@/lib/queryClient';
import { db, sesionMock } from '@/mocks/db';
import { renderApp } from '@/test/renderApp';
import { AportacionesDelMiembro } from './components/AportacionesDelMiembro';
import { textoVariacion } from './formato';
import { esquemaDonacion } from './schemas';

const tablaAportaciones = () => screen.findByRole('table', { name: 'Aportaciones' });

describe('listado de aportaciones (F4-01)', () => {
  it('muestra las del mes con el total del filtro y sin anuladas', async () => {
    await renderApp('/donaciones', { como: 'u-tesorero' });
    const tabla = await tablaAportaciones();
    expect(within(tabla).getAllByRole('row')).toHaveLength(1 + 4); // encabezado + 4 vigentes
    expect(within(tabla).getByText('José Chan May')).toBeInTheDocument();
    expect(within(tabla).getAllByText('Anónimo').length).toBeGreaterThan(0);
    expect(within(tabla).queryByText('Anulada')).not.toBeInTheDocument();
    // 1500.00 + 320.50 + 2000.00 + 800.00
    expect(await screen.findByText('$4,620.50')).toBeInTheDocument();
  });

  it('las anuladas se muestran tachadas con su badge y no suman en el total', async () => {
    const { usuario } = await renderApp('/donaciones', { como: 'u-admin' });
    await tablaAportaciones();
    await usuario.click(screen.getByRole('checkbox', { name: 'Incluir anuladas' }));
    const tabla = await screen.findByRole('table', { name: 'Aportaciones' });
    await waitFor(() => expect(within(tabla).getAllByRole('row')).toHaveLength(1 + 5));
    expect(within(tabla).getByText('Anulada')).toBeInTheDocument();
    expect(within(tabla).getByText('Luis Aké Novelo')).toHaveClass('line-through');
    expect(screen.getByText('$4,620.50')).toBeInTheDocument();
  });

  it('"Solo anónimas" filtra la lista y el total', async () => {
    const { usuario } = await renderApp('/donaciones', { como: 'u-tesorero' });
    await tablaAportaciones();
    await usuario.click(screen.getByRole('checkbox', { name: 'Solo anónimas' }));
    await waitFor(async () => {
      const tabla = await tablaAportaciones();
      expect(within(tabla).getAllByRole('row')).toHaveLength(1 + 1);
    });
    expect(screen.getAllByText('$320.50').length).toBeGreaterThan(0);
    expect(screen.queryByText('$4,620.50')).not.toBeInTheDocument();
  });

  it('estado vacío con acción para quien puede registrar', async () => {
    db.donaciones = [];
    await renderApp('/donaciones', { como: 'u-tesorero' });
    expect(await screen.findByText('No hay aportaciones en este periodo')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Registrar aportación/ }).length).toBeGreaterThan(
      1,
    );
  });

  it('SECRETARIO y COORDINADOR no entran a /donaciones (403)', async () => {
    for (const como of ['u-secretario', 'u-coordinador']) {
      const { unmount } = await renderApp('/donaciones', { como });
      expect(await screen.findByRole('heading', { name: 'No tienes acceso' })).toBeInTheDocument();
      expect(screen.queryByRole('table', { name: 'Aportaciones' })).not.toBeInTheDocument();
      unmount();
      sesionMock.cerrar();
    }
  });

  it('PASTOR (solo lectura) ve el listado pero no el botón "Registrar aportación"', async () => {
    await renderApp('/donaciones', { como: 'u-pastor' });
    await tablaAportaciones();
    expect(screen.queryByRole('button', { name: /Registrar aportación/ })).not.toBeInTheDocument();
  });
});

describe('registrar aportación (F4-02)', () => {
  it('valida los campos obligatorios antes de enviar', async () => {
    const { usuario } = await renderApp('/donaciones', { como: 'u-tesorero' });
    await usuario.click(await screen.findByRole('button', { name: /Registrar aportación/ }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Registrar' }));
    expect(await within(dialogo).findByText('Escribe el monto.')).toBeInTheDocument();
    expect(
      within(dialogo).getByText('Elige el donante o marca la aportación como anónima.'),
    ).toBeInTheDocument();
    expect(db.donaciones.some((d) => d.monto === '0.00')).toBe(false);
  });

  it('el interruptor anónima oculta el selector de donante y guarda sin miembro', async () => {
    const { usuario } = await renderApp('/donaciones', { como: 'u-tesorero' });
    const antes = db.donaciones.length;
    await usuario.click(await screen.findByRole('button', { name: /Registrar aportación/ }));
    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByRole('combobox', { name: /Donante/ })).toBeInTheDocument();

    await usuario.click(within(dialogo).getByRole('switch', { name: 'Aportación anónima' }));
    expect(within(dialogo).queryByRole('combobox', { name: /Donante/ })).not.toBeInTheDocument();

    await usuario.type(within(dialogo).getByLabelText(/Monto/), '250');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(db.donaciones).toHaveLength(antes + 1));
    const nueva = db.donaciones.at(-1)!;
    expect(nueva).toMatchObject({
      monto: '250.00',
      miembroId: null,
      anonima: true,
      concepto: 'DIEZMO',
      registradoPorId: 'u-tesorero',
    });
  });

  it('el concepto "Otro" exige describirlo', async () => {
    const { usuario } = await renderApp('/donaciones', { como: 'u-admin' });
    await usuario.click(await screen.findByRole('button', { name: /Registrar aportación/ }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('combobox', { name: /Concepto/ }));
    await usuario.click(await screen.findByRole('option', { name: 'Otro' }));
    await usuario.click(within(dialogo).getByRole('switch', { name: 'Aportación anónima' }));
    await usuario.type(within(dialogo).getByLabelText(/Monto/), '100');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Registrar' }));
    expect(
      await within(dialogo).findByText('Describe el concepto cuando es "Otro".'),
    ).toBeInTheDocument();
  });

  it('el esquema rechaza una aportación anónima con donante', () => {
    const base = {
      fecha: '2020-01-01',
      monto: '10.50',
      concepto: 'OFRENDA',
      conceptoDetalle: '',
      metodo: 'EFECTIVO',
      referencia: '',
      notas: '',
    } as const;
    const anonimaConDonante = esquemaDonacion.safeParse({
      ...base,
      anonima: true,
      miembroId: 'm-jose',
    });
    expect(anonimaConDonante.success).toBe(false);
    expect(anonimaConDonante.error?.issues[0]?.message).toBe(
      'Una aportación anónima no puede tener donante.',
    );
    expect(
      esquemaDonacion.safeParse({ ...base, anonima: false, miembroId: 'm-jose' }).success,
    ).toBe(true);
    expect(
      esquemaDonacion.safeParse({ ...base, monto: '10.555', anonima: true, miembroId: null })
        .success,
    ).toBe(false);
  });
});

describe('detalle, edición y anulación (F4-03)', () => {
  it('muestra la auditoría de una aportación', async () => {
    const { usuario } = await renderApp('/donaciones', { como: 'u-tesorero' });
    await tablaAportaciones();
    await usuario.click(
      screen.getAllByRole('button', { name: /Ver detalle de la aportación de María/ })[0]!,
    );
    const dialogo = await screen.findByRole('dialog');
    expect(await within(dialogo).findByText(/Registrada por/)).toBeInTheDocument();
    expect(within(dialogo).getByText(/Registrada por/).parentElement).toHaveTextContent(
      db.usuarios.find((u) => u.id === 'u-tesorero')!.nombre,
    );
    expect(within(dialogo).getByText('SPEI-4471')).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: /Editar/ })).toBeInTheDocument();
  });

  it('anular exige un motivo y deja la aportación anulada (nunca se borra)', async () => {
    const { usuario } = await renderApp('/donaciones', { como: 'u-tesorero' });
    await tablaAportaciones();
    await usuario.click(
      screen.getAllByRole('button', { name: /Ver detalle de la aportación de José/ })[0]!,
    );
    await usuario.click(await screen.findByRole('button', { name: /Anular/ }));
    const confirmar = await screen.findByRole('dialog');
    const boton = within(confirmar).getByRole('button', { name: 'Anular' });
    expect(boton).toBeDisabled();

    await usuario.type(within(confirmar).getByLabelText(/Motivo/), 'Monto mal capturado');
    expect(boton).toBeEnabled();
    await usuario.click(boton);

    await waitFor(() => expect(db.donaciones.find((d) => d.id === 'd-1')?.anulada).toBe(true));
    const d = db.donaciones.find((x) => x.id === 'd-1')!;
    expect(d.motivoAnulacion).toBe('Monto mal capturado');
    expect(d.actualizadoPorId).toBe('u-tesorero');
    expect(db.donaciones.some((x) => x.id === 'd-1')).toBe(true);
  });

  it('una aportación anulada no muestra Editar ni Anular, y explica el motivo', async () => {
    const { usuario } = await renderApp('/donaciones?anuladas=true', { como: 'u-admin' });
    await tablaAportaciones();
    await usuario.click(
      await screen
        .findAllByRole('button', { name: /Ver detalle de la aportación de Luis/ })
        .then((b) => b[0]!),
    );
    const dialogo = await screen.findByRole('dialog');
    expect(await within(dialogo).findByText('Captura duplicada')).toBeInTheDocument();
    expect(within(dialogo).getByText(/Anulada por/)).toBeInTheDocument();
    expect(within(dialogo).queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
    expect(within(dialogo).queryByRole('button', { name: /Anular/ })).not.toBeInTheDocument();
  });

  it('PASTOR ve el detalle pero sin Editar ni Anular', async () => {
    const { usuario } = await renderApp('/donaciones', { como: 'u-pastor' });
    await tablaAportaciones();
    await usuario.click(screen.getAllByRole('button', { name: /Ver detalle/ })[0]!);
    const dialogo = await screen.findByRole('dialog');
    await within(dialogo).findByText(/Registrada por/);
    expect(within(dialogo).queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
    expect(within(dialogo).queryByRole('button', { name: /Anular/ })).not.toBeInTheDocument();
  });
});

describe('resúmenes (F4-04, F4-05)', () => {
  it('resumen por periodo: gráfica con tabla alternativa y montos con la moneda', async () => {
    const { usuario } = await renderApp('/donaciones?tab=resumen&agrupar=concepto', {
      como: 'u-tesorero',
    });
    const tabla = await screen.findByRole('table', { name: 'Resumen de ingresos' });
    expect(within(tabla).getByText('Diezmo')).toBeInTheDocument();
    expect(within(tabla).getAllByText(/^\$/).length).toBeGreaterThan(1);
    await usuario.click(
      screen.getByRole('button', { name: /Ver como tabla: Ingresos por concepto/ }),
    );
    expect(
      await screen.findByRole('table', { name: 'Datos de Ingresos por concepto' }),
    ).toBeInTheDocument();
  });

  it('resumen mensual: total y variación contra el mes anterior', async () => {
    await renderApp('/donaciones?tab=mensual', { como: 'u-tesorero' });
    expect(await screen.findByText('$4,620.50')).toBeInTheDocument();
    expect(screen.getByText('+20.0 %')).toBeInTheDocument();
    expect(screen.getByText('Mes anterior: $3,850.00')).toBeInTheDocument();
    expect(screen.getByText('Aportaciones anónimas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Descargar PDF/ })).toBeEnabled();
  });

  it('variación null muestra "Sin datos del mes anterior"', async () => {
    db.donaciones = db.donaciones.filter((d) => d.id.startsWith('d-') && !/^d-[567]$/.test(d.id));
    await renderApp('/donaciones?tab=mensual', { como: 'u-admin' });
    expect(await screen.findByText('Sin datos del mes anterior')).toBeInTheDocument();
  });

  it('textoVariacion usa signo y el formato es-MX', () => {
    expect(textoVariacion(20)).toBe('+20.0 %');
    expect(textoVariacion(-5.25)).toBe('−5.3 %');
    expect(textoVariacion(0)).toBe('0.0 %');
  });
});

describe('AportacionesDelMiembro (pestaña del perfil, F2-11)', () => {
  function Contenido({ miembroId }: { miembroId: string }) {
    const { estado } = useSesion();
    if (estado === 'cargando') return null;
    return <AportacionesDelMiembro miembroId={miembroId} />;
  }

  function montar(como: string, miembroId = 'm-jose') {
    sesionMock.abrir(como);
    return render(
      <Providers queryClient={crearQueryClient()}>
        <MemoryRouter>
          <Contenido miembroId={miembroId} />
        </MemoryRouter>
      </Providers>,
    );
  }

  it('lista las aportaciones del miembro con su total', async () => {
    montar('u-tesorero');
    const lista = await screen.findByRole('list', { name: 'Aportaciones del miembro' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(10); // las 10 más recientes (hay 11)
    expect(screen.getByText(/Total aportado/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todas en Donaciones' })).toHaveAttribute(
      'href',
      '/donaciones',
    );
  });

  it('no renderiza nada ni pide datos financieros a quien no tiene donaciones:leer', async () => {
    const { container } = montar('u-secretario');
    // Pasada la sesión, el componente no debe mostrar nada
    await waitFor(() => expect(sesionMock.obtener()).toBe('u-secretario'));
    await new Promise((r) => setTimeout(r, 300));
    expect(container.querySelector('[aria-label="Aportaciones del miembro"]')).toBeNull();
    expect(screen.queryByText(/Total aportado/)).not.toBeInTheDocument();
  });

  it('estado vacío cuando el miembro no tiene aportaciones', async () => {
    montar('u-admin', 'm-sofia');
    expect(await screen.findByText('Este miembro aún no tiene aportaciones')).toBeInTheDocument();
  });
});
