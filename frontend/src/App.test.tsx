import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PASSWORD_MOCK } from '@/mocks/datos/b1';
import { renderApp } from '@/test/renderApp';

describe('sesión (F1-08, F1-09)', () => {
  it('sin sesión, una ruta protegida redirige a /login y tras entrar vuelve a ella', async () => {
    const { usuario } = await renderApp('/configuracion');
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();

    await usuario.type(screen.getByLabelText('Correo'), 'admin@iglesia.local');
    await usuario.type(screen.getByLabelText('Contraseña'), PASSWORD_MOCK);
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(
      await screen.findByRole('heading', { name: 'Configuración de la iglesia' }),
    ).toBeInTheDocument();
  });

  it('sin redirect, tras entrar va al inicio', async () => {
    const { usuario } = await renderApp('/login');
    await usuario.type(await screen.findByLabelText('Correo'), 'pastor@iglesia.local');
    await usuario.type(screen.getByLabelText('Contraseña'), PASSWORD_MOCK);
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(
      await screen.findByRole('heading', {
        name: /(Buenos días|Buenas tardes|Buenas noches), Pastor/,
      }),
    ).toBeInTheDocument();
  });

  it('credenciales inválidas muestran el mensaje del servidor', async () => {
    const { usuario } = await renderApp('/login');
    await usuario.type(await screen.findByLabelText('Correo'), 'admin@iglesia.local');
    await usuario.type(screen.getByLabelText('Contraseña'), 'incorrecta1');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
  });

  it('429 muestra "Demasiados intentos, espera un minuto"', async () => {
    const { usuario } = await renderApp('/login');
    await usuario.type(await screen.findByLabelText('Correo'), 'bloqueado@iglesia.local');
    await usuario.type(screen.getByLabelText('Contraseña'), 'loquesea1');
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Demasiados intentos, espera un minuto.',
    );
  });

  it('valida el formulario antes de enviar', async () => {
    const { usuario } = await renderApp('/login');
    await usuario.click(await screen.findByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Escribe tu correo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true');
  });

  it('usuario ya autenticado en /login es redirigido a /', async () => {
    await renderApp('/login', { como: 'u-admin' });
    expect(
      await screen.findByRole('heading', {
        name: /(Buenos días|Buenas tardes|Buenas noches), Administrador/,
      }),
    ).toBeInTheDocument();
  });

  it('recargar mantiene la sesión (cookie de refresh)', async () => {
    await renderApp('/mi-cuenta', { como: 'u-secretario' });
    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument();
    expect(screen.getAllByText('Lucía Hernández').length).toBeGreaterThan(0);
  });

  it('cerrar sesión vuelve a /login y limpia la caché de TanStack Query', async () => {
    const { usuario, queryClient } = await renderApp('/usuarios', { como: 'u-admin' });
    await screen.findByRole('table', { name: 'Usuarios' });
    const hayUsuariosEnCache = () =>
      queryClient.getQueryCache().findAll({ queryKey: ['usuarios'] }).length > 0;
    expect(hayUsuariosEnCache()).toBe(true);

    await usuario.click(screen.getByRole('button', { name: /Menú de cuenta/ }));
    await usuario.click(await screen.findByRole('menuitem', { name: /Cerrar sesión/ }));

    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
    expect(hayUsuariosEnCache()).toBe(false);
  });
});

describe('permisos en la UI (F1-10)', () => {
  it('TESORERO no ve "Usuarios" en el menú y /usuarios muestra 403', async () => {
    await renderApp('/usuarios', { como: 'u-tesorero' });
    expect(await screen.findByRole('heading', { name: 'No tienes acceso' })).toBeInTheDocument();
    const menu = screen.getAllByRole('navigation', { name: 'Menú principal' })[0]!;
    expect(within(menu).queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument();
    expect(within(menu).getByRole('link', { name: 'Configuración' })).toBeInTheDocument();
  });

  it('ADMIN ve "Usuarios" y el ítem activo queda marcado', async () => {
    await renderApp('/usuarios', { como: 'u-admin' });
    const menu = (await screen.findAllByRole('navigation', { name: 'Menú principal' }))[0]!;
    await waitFor(() =>
      expect(within(menu).getByRole('link', { name: 'Usuarios' })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    );
  });

  it('ruta inexistente muestra 404', async () => {
    await renderApp('/no-existe', { como: 'u-admin' });
    expect(
      await screen.findByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
