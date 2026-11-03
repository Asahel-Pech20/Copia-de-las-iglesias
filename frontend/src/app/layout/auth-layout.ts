import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarcaIglesia } from './marca-iglesia';

/** Layout de pantallas públicas (login, recuperar, restablecer). */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, MarcaIglesia],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="fondo">
      <div class="tarjeta caja">
        <app-marca-iglesia [grande]="true" />
        <router-outlet />
      </div>
    </main>
  `,
  styles: `
    .fondo {
      display: flex;
      min-height: 100dvh;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .caja {
      display: flex;
      width: 100%;
      max-width: 24rem;
      flex-direction: column;
      gap: 24px;
      padding: 24px;
    }
  `,
})
export class AuthLayout {}
