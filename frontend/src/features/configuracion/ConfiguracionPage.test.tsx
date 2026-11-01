import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { db } from '@/mocks/db';
import { server } from '@/mocks/server';
import { ruta } from '@/mocks/utils';
import { renderApp } from '@/test/renderApp';

describe('datos institucionales (F1-14)', () => {
  it('cambiar el nombre actualiza el layout sin recargar', async () => {
    const { usuario } = await renderApp('/configuracion', { como: 'u-admin' });
    const nombre = await screen.findByLabelText(/Nombre de la iglesia/);
    await usuario.clear(nombre);
    await usuario.type(nombre, 'Iglesia Nueva Esperanza');
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    const barraLateral = screen.getAllByRole('complementary')[0]!;
    expect(await within(barraLateral).findByText('Iglesia Nueva Esperanza')).toBeInTheDocument();
    expect(db.configuracion.nombre).toBe('Iglesia Nueva Esperanza');
  });

  it('valida correo y sitio web', async () => {
    const { usuario } = await renderApp('/configuracion', { como: 'u-admin' });
    const correo = await screen.findByLabelText('Correo de contacto');
    await usuario.clear(correo);
    await usuario.type(correo, 'x');
    await usuario.type(screen.getByLabelText('Sitio web'), 'iglesia');
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByText('Correo no válido.')).toBeInTheDocument();
    expect(screen.getByText('URL no válida (incluye https://).')).toBeInTheDocument();
  });

  it('roles distintos de ADMIN ven la configuración en modo lectura', async () => {
    await renderApp('/configuracion', { como: 'u-secretario' });
    expect(await screen.findByLabelText(/Nombre de la iglesia/)).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument();
  });
});

describe('logotipo (F1-15)', () => {
  it('archivo inválido muestra error sin llamar al backend', async () => {
    const llamada = vi.fn();
    server.use(
      http.post(ruta('/configuracion/logo'), () => {
        llamada();
        return HttpResponse.json({});
      }),
    );
    const { usuario } = await renderApp('/configuracion', { como: 'u-admin' });
    await usuario.click(await screen.findByRole('tab', { name: 'Logotipo' }));
    const pdf = new File(['%PDF'], 'logo.pdf', { type: 'application/pdf' });
    // El navegador puede dejar pasar archivos que no cumplen `accept`: se valida igual
    fireEvent.change(screen.getByLabelText('Archivo del logotipo'), { target: { files: [pdf] } });
    expect(
      await screen.findByText('Formato no permitido. Usa PNG, JPG, WEBP o SVG.'),
    ).toBeInTheDocument();

    const grande = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'logo.png', {
      type: 'image/png',
    });
    fireEvent.change(screen.getByLabelText('Archivo del logotipo'), {
      target: { files: [grande] },
    });
    expect(await screen.findByText('El archivo supera 2 MB.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Subir logotipo' })).not.toBeInTheDocument();
    expect(llamada).not.toHaveBeenCalled();
  });

  it('logo nuevo visible en el layout', async () => {
    URL.createObjectURL ??= () => 'blob:vista-previa';
    URL.revokeObjectURL ??= () => {};
    // undici (Node) no puede parsear el multipart que genera jsdom; en el navegador sí se parsea el archivo
    server.use(
      http.post(ruta('/configuracion/logo'), () => {
        db.configuracion.logoUrl = 'data:image/png;base64,iVBORw0KGgo=';
        return HttpResponse.json({ data: db.configuracion });
      }),
    );
    const { usuario } = await renderApp('/configuracion', { como: 'u-admin' });
    await usuario.click(await screen.findByRole('tab', { name: 'Logotipo' }));
    const png = new File([new Uint8Array([137, 80, 78, 71])], 'logo.png', { type: 'image/png' });
    await usuario.upload(screen.getByLabelText('Archivo del logotipo'), png);
    await usuario.click(await screen.findByRole('button', { name: 'Subir logotipo' }));

    const barraLateral = screen.getAllByRole('complementary')[0]!;
    await waitFor(() =>
      expect(barraLateral.querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/png/),
    );
  });
});

describe('horarios (F1-16)', () => {
  it('lista agrupada por día', async () => {
    const { usuario } = await renderApp('/configuracion', { como: 'u-admin' });
    await usuario.click(await screen.findByRole('tab', { name: 'Horarios' }));
    const domingo = await screen.findByRole('region', { name: 'Domingo' });
    expect(within(domingo).getByText('Culto dominical')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Miércoles' })).toBeInTheDocument();
  });

  it('horaFin <= horaInicio queda bloqueado en el formulario', async () => {
    const { usuario } = await renderApp('/configuracion', { como: 'u-admin' });
    await usuario.click(await screen.findByRole('tab', { name: 'Horarios' }));
    await usuario.click(await screen.findByRole('button', { name: /Agregar horario/ }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.type(within(dialogo).getByLabelText(/Nombre/), 'Ensayo');
    await usuario.type(within(dialogo).getByLabelText(/Hora de inicio/), '18:00');
    await usuario.type(within(dialogo).getByLabelText(/Hora de fin/), '17:00');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));
    expect(
      await within(dialogo).findByText('La hora de fin debe ser posterior a la de inicio.'),
    ).toBeInTheDocument();
    expect(db.horarios.some((h) => h.nombre === 'Ensayo')).toBe(false);
  });

  it('elimina con confirmación', async () => {
    const { usuario } = await renderApp('/configuracion', { como: 'u-admin' });
    await usuario.click(await screen.findByRole('tab', { name: 'Horarios' }));
    await usuario.click(await screen.findByRole('button', { name: 'Eliminar Estudio bíblico' }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() =>
      expect(db.horarios.some((h) => h.nombre === 'Estudio bíblico')).toBe(false),
    );
  });
});
