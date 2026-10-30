# F1 — Base UI, Layout, Auth, Usuarios y Configuración (Frontend)

**Dueño:** Santiago Asahel Pech Ake · **RF:** RF-01, RF-10 · **Par backend:** [B1](../../backend/B1-auth-usuarios-config/plan.md)

## Objetivo
Construir la base del frontend que usan F2, F3 y F4: proyecto Vite, tokens de diseño, componentes compartidos, layout con menú por permisos, cliente API con refresh automático, mocks MSW, rutas protegidas; y las pantallas de login, recuperación de contraseña, usuarios y configuración de la iglesia.

> ⚠️ F1 es la ruta crítica de la Fase 0. F1-01 a F1-05 deben terminar en la **semana 1**.

## Archivos de tareas
| Archivo | Contenido | Tareas |
|---|---|---|
| [tasks-01-base-ui.md](tasks-01-base-ui.md) | Proyecto, tokens, componentes, layout, API client, MSW | F1-01 … F1-07 |
| [tasks-02-auth-usuarios.md](tasks-02-auth-usuarios.md) | Login, sesión, guards, recuperación, gestión de usuarios | F1-08 … F1-13 |
| [tasks-03-configuracion.md](tasks-03-configuracion.md) | Configuración institucional, logo, horarios | F1-14 … F1-16 |

## Calendario
| Fase | Semana | Tareas |
|---|---|---|
| 0 | 1 | F1-01, F1-02, F1-03, F1-04, F1-05 |
| 1 | 2–3 | F1-06, F1-07, F1-08, F1-09, F1-10, F1-11 |
| 2 | 4–5 | F1-12, F1-13, F1-14, F1-15 |
| 3 | 7–8 | F1-16, pulido visual global, revisión de accesibilidad |

## Entregables para otros
- `components/comunes/`: `PageHeader`, `DataTable`, `FiltrosBar`, `CampoBusqueda`, `FormField`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `SkeletonTabla`, `Badge` de estado, `StatCard`, `DateRangePicker`, `Paginacion`.
- `lib/api.ts`, `lib/permisos.ts`, `lib/formato.ts`, `hooks/usePermiso`, `<Puede>`, `<RutaProtegida>`.
- `src/types/comunes.ts` (`RespuestaLista<T>`, `RespuestaObjeto<T>`, `ErrorApi`), `src/types/` de usuarios y configuración.
- Registro central de rutas y menú (`app/router.tsx`, `app/menu.ts`) donde F2–F4 agregan sus entradas.

## Riesgos
- Componentes base tardíos → F2–F4 duplican código. Publicar primero versiones simples y mejorarlas después sin cambiar sus props.
