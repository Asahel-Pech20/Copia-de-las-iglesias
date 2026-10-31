import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('consulta la API a través de MSW', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'AppIglesia' })).toBeInTheDocument();
    expect(await screen.findByText('API: ok')).toBeInTheDocument();
  });
});
