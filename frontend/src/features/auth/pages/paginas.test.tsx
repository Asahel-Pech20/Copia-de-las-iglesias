import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PASSWORD_MOCK } from '@/mocks/datos/b1';
import { renderApp } from '@/test/renderApp';

describe('recuperar y restablecer contraseña (F1-11)', () => {
  it('recuperar muestra un mensaje neutro', async () => {
    const { usuario } = await renderApp('/recuperar');
    await usuario.type(await screen.findByLabelText('Correo'), 'noexiste@iglesia.local');
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }));
    expect(
      await screen.findByText(
        'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.',
      ),
    ).toBeInTheDocument();
  });

  it('token inválido muestra mensaje y enlace para solicitar otro', async () => {
    const { usuario } = await renderApp('/restablecer?token=caducado');
    await usuario.type(await screen.findByLabelText('Contraseña nueva'), 'Nueva1234');
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'Nueva1234');
    await usuario.click(screen.getByRole('button', { name: 'Guardar contraseña' }));
    expect(await screen.findByText('El enlace no es válido o ya expiró.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solicitar un enlace nuevo' })).toHaveAttribute(
      'href',
      '/recuperar',
    );
  });

  it('sin token muestra directamente el mensaje de enlace inválido', async () => {
    await renderApp('/restablecer');
    expect(await screen.findByText('El enlace no es válido o ya expiró.')).toBeInTheDocument();
  });

  it('aplica las reglas de contraseña y la confirmación', async () => {
    const { usuario } = await renderApp('/restablecer?token=token-valido');
    await usuario.type(await screen.findByLabelText('Contraseña nueva'), 'solotexto');
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'otra');
    await usuario.click(screen.getByRole('button', { name: 'Guardar contraseña' }));
    expect(await screen.findByText('Debe incluir al menos un número.')).toBeInTheDocument();
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('token válido guarda la contraseña', async () => {
    const { usuario } = await renderApp('/restablecer?token=token-valido');
    await usuario.type(await screen.findByLabelText('Contraseña nueva'), 'Nueva1234');
    await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'Nueva1234');
    await usuario.click(screen.getByRole('button', { name: 'Guardar contraseña' }));
    expect(await screen.findByText('Tu contraseña se guardó correctamente.')).toBeInTheDocument();
  });
});

describe('mi cuenta (F1-13)', () => {
  it('contraseña actual incorrecta → error en el campo', async () => {
    const { usuario } = await renderApp('/mi-cuenta', { como: 'u-pastor' });
    await usuario.type(await screen.findByLabelText('Contraseña actual'), 'equivocada1');
    await usuario.type(screen.getByLabelText('Contraseña nueva'), 'Nueva1234');
    await usuario.type(screen.getByLabelText('Confirmar contraseña nueva'), 'Nueva1234');
    await usuario.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
    expect(await screen.findByText('La contraseña actual es incorrecta.')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña actual')).toHaveAttribute('aria-invalid', 'true');
  });

  it('cambia la contraseña con la actual correcta', async () => {
    const { usuario } = await renderApp('/mi-cuenta', { como: 'u-pastor' });
    await usuario.type(await screen.findByLabelText('Contraseña actual'), PASSWORD_MOCK);
    await usuario.type(screen.getByLabelText('Contraseña nueva'), 'Nueva1234');
    await usuario.type(screen.getByLabelText('Confirmar contraseña nueva'), 'Nueva1234');
    await usuario.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
    expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument();
  });
});
