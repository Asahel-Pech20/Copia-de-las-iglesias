# Migración del frontend a Angular

> Los cursos anteriores usaban **Express + Angular**. El frontend se había hecho en React por descuido; esta copia lo reescribe en **Angular 21** con **Angular Material**. El backend no cambia: mismo contrato (`specs.md §7`).

## Estado

| Parte | Estado |
|---|---|
| **F1**: base, layout, sesión, permisos, usuarios, configuración | ✅ Migrado |
| **F2**: miembros, ministerios, `SelectorMiembros` | ✅ Migrado |
| **F3**: eventos, calendario, asistencia, anuncios, cartelera | ⏳ Pendiente (en el menú aparece deshabilitado) |
| **F4**: donaciones, dashboard, reportes | ⏳ Pendiente (en el menú aparece deshabilitado) |

Verificado: 27 pruebas de frontend (`ng test`), lint, typecheck, formato y `ng build` en verde; pantallas revisadas en el navegador con mocks.

¿Por qué Angular 21 y no 22? Angular 22 pide Node ≥ 24.15 y el equipo usa Node 22/24.12. Angular 21 funciona con ambos.

## Cómo correrlo

```bash
pnpm install
pnpm --filter frontend dev      # http://localhost:5173 con datos simulados
pnpm --filter frontend test     # pruebas (Vitest)
pnpm --filter frontend build    # producción (sin mocks)
```

Usuarios de los mocks: `<rol>@iglesia.local` / `Iglesia123`. Para usar el backend real: `usarMocks: false` en `frontend/src/environments/environment.ts`.

## Equivalencias React → Angular (para migrar F3 y F4)

| En React | En Angular | Archivo |
|---|---|---|
| `lib/api.ts` (Axios + refresh) | `Api` + `interceptorApi` (HttpClient) | `core/api.ts` |
| `AuthProvider` / `useSesion()` | `SesionService` (signals) | `core/sesion.service.ts` |
| `usePermiso('x')` | `sesion.puede('x')` | `core/sesion.service.ts` |
| `<Puede permiso="x">` | `*appPuede="'x'"` | `core/puede.directive.ts` |
| `<RutaProtegida permiso="x">` | `canActivate: [rutaProtegida]`, `data: { permiso: 'x' }` | `core/guards.ts`, `app.routes.ts` |
| `useBlocker` (salir sin guardar) | `canDeactivate: [cambiosSinGuardar]` | `core/cambios-sin-guardar.ts` |
| `useFiltrosURL` | `filtrosURL()` | `core/filtros-url.ts` |
| `useQuery` | `rxResource` + servicio del módulo; leer con `valorDe()` fuera de la rama sin error | `core/recurso.ts` |
| `useMutation` + invalidar | llamada al servicio + `recurso.reload()` | — |
| React Hook Form + Zod | Reactive Forms + validadores con mensaje | `core/validadores.ts` |
| `notificar.exito()` | `NotificarService` (snackbar) | `core/notificar.service.ts` |
| `ConfirmDialog` | `ConfirmarService.abrir({...})` | `compartido/confirmar-dialogo.ts` |
| `PageHeader`, `EmptyState`, `ErrorState`, `SkeletonTabla`, `Paginacion`, `BadgeEstado`, `CampoBusqueda` | `app-page-header`, `app-estado-vacio`, `app-estado-error`, `app-esqueleto`, `app-paginacion`, `app-badge-estado`, `app-campo-busqueda` | `compartido/` |
| `DataTable` | `mat-table` dentro de `.contenedor-tabla` (scroll horizontal en móvil) | `styles.scss` |
| `SelectorMiembros` | `<app-selector-miembros [(seleccion)]="ids" />` | `features/miembros/selector-miembros.ts` |
| MSW con Service Worker | los mismos handlers, ejecutados por `interceptorMocks` | `mocks/interceptor.ts` |
| `renderApp('/ruta', { como })` | `abrirApp('/ruta', { como: 'admin@iglesia.local' })` | `prueba/entorno.ts` |

## Para migrar un módulo de F3/F4

1. Copiar sus tipos de `src/types/` (ya están en `src/app/tipos/`), sus datos de mocks (`mocks/datos/b3.ts`, `b4.ts`) y handlers, y registrarlos en `mocks/db.ts` y `mocks/handlers/index.ts`.
2. Crear `features/<modulo>/<modulo>.service.ts` con las llamadas del contrato.
3. Escribir las páginas con Material y los componentes de `compartido/`.
4. Registrar las rutas en `app.routes.ts` con su permiso y quitar `pendiente: true` en `core/menu.ts`.
5. Conectar lo que F2 dejó esperando: pestañas *Asistencia* y *Aportaciones* del perfil y *Actividades* del ministerio.

## Pendientes conocidos

- Catálogo de componentes `/_dev/ui` de React: no se migró.
- Calendario (FullCalendar tiene versión para Angular) y gráficas (Recharts es solo de React): se eligen al migrar F3 y F4.
- No se probó contra el backend real; solo con mocks.
