import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { USAR_MOCKS } from './lib/config';
import './index.css';

// Con VITE_USE_MOCKS=true el frontend funciona sin backend (MSW intercepta las peticiones)
async function activarMocks() {
  if (!USAR_MOCKS) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
}

activarMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
