import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { db } from '@/mocks/db';
import { renderApp } from '@/test/renderApp';

type Usuario = Awaited<ReturnType<typeof renderApp>>['usuario'];

async function abrirAcciones(usuario: Usuario, nombre: string) {
  const tabla = await screen.findByRole('table', { name: 'Usuarios' });
  await usuario.click(within(tabla).getByRole('button', { name: `Acciones de ${nombre}` }));
}

async function editar(usuario: Usuario, nombre: string) {
  await abrirAcciones(usuario, nombre);
  await usuario.click(await screen.findByRole('menuitem', { name: /Editar/ }));
  return screen.findByRole('dialog');
}

describe('gestión de usuarios (F1-12)', () => {
  it('lista los usuarios con su rol y estado', async () => {
    await renderApp('/usuarios', { como: 'u-admin' });
    const tabla = await screen.findByRole('table', { name: 'Usuarios' });
    expect(within(tabla).getByText('Jorge Canul')).toBeInTheDocument();
    expect(within(tabla).getByText('Tesorero')).toBeInTheDocument();
  });

  it('busca por nombre con debounce', async () => {
    const { usuario } = await renderApp('/usuarios', { como: 'u-admin' });
    await screen.findByRole('table', { name: 'Usuarios' });
    await usuario.type(screen.getByRole('searchbox'), 'lucía');
    await waitFor(() => {
      const tabla = screen.getByRole('table', { name: 'Usuarios' });
      expect(within(tabla).queryByText('Jorge Canul')).not.toBeInTheDocument();
      expect(within(tabla).getByText('Lucía Hernández')).toBeInTheDocument();
    });
  });

  it('muestra estado vacío si no hay resultados', async () => {
    const { usuario } = await renderApp('/usuarios', { como: 'u-admin' });
    await screen.findByRole('table', { name: 'Usuarios' });
    await usuario.type(screen.getByRole('searchbox'), 'zzzz');
    expect(await screen.findByText('No hay usuarios con estos filtros')).toBeInTheDocument();
  });

  it('crea un usuario', async () => {
    const { usuario } = await renderApp('/usuarios', { como: 'u-admin' });
    await usuario.click(await screen.findByRole('button', { name: /Nuevo usuario/ }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.type(within(dialogo).getByLabelText(/Nombre/), 'Rosa Pech');
    await usuario.type(within(dialogo).getByLabelText(/Correo/), 'rosa@iglesia.local');
    await usuario.click(within(dialogo).getByRole('combobox'));
    await usuario.click(await screen.findByRole('option', { name: 'Secretario' }));
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));
    await waitFor(() =>
      expect(db.usuarios.find((u) => u.email === 'rosa@iglesia.local')?.rol).toBe('SECRETARIO'),
    );
  });

  it('el ADMIN no ve "Desactivar" sobre sí mismo', async () => {
    const { usuario } = await renderApp('/usuarios', { como: 'u-admin' });
    await abrirAcciones(usuario, 'Administrador General');
    expect(await screen.findByRole('menuitem', { name: /Editar/ })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Desactivar/ })).not.toBeInTheDocument();
  });

  it('desactiva otro usuario tras confirmar', async () => {
    const { usuario } = await renderApp('/usuarios', { como: 'u-admin' });
    await abrirAcciones(usuario, 'Jorge Canul');
    await usuario.click(await screen.findByRole('menuitem', { name: /Desactivar/ }));
    const dialogo = await screen.findByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Desactivar' }));
    await waitFor(() => expect(db.usuarios.find((u) => u.id === 'u-tesorero')?.activo).toBe(false));
  });

  it('error 422 (último admin) se muestra dentro del diálogo', async () => {
    const { usuario } = await renderApp('/usuarios', { como: 'u-admin' });
    const dialogo = await editar(usuario, 'Administrador General');
    await usuario.click(within(dialogo).getByRole('combobox'));
    await usuario.click(await screen.findByRole('option', { name: 'Pastor' }));
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));
    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'Debe existir al menos un administrador activo.',
    );
    expect(db.usuarios.find((u) => u.id === 'u-admin')?.rol).toBe('ADMIN');
  });

  it('error 409 (correo duplicado) se muestra en el campo', async () => {
    const { usuario } = await renderApp('/usuarios', { como: 'u-admin' });
    const dialogo = await editar(usuario, 'Jorge Canul');
    const correo = within(dialogo).getByLabelText(/Correo/);
    await usuario.clear(correo);
    await usuario.type(correo, 'pastor@iglesia.local');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));
    expect(await within(dialogo).findByText('El correo ya está registrado.')).toBeInTheDocument();
    expect(correo).toHaveAttribute('aria-invalid', 'true');
  });
});
