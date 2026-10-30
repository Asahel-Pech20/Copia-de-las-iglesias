# B1 — Infraestructura, Auth, Usuarios y Configuración (Backend)

**Dueño:** Santiago Asahel Pech Ake · **RF:** RF-01, RF-10 · **Par frontend:** [F1](../../frontend/F1-base-auth-config/plan.md)

## Objetivo
Dejar lista la base técnica del backend sobre la que trabajan B2, B3 y B4: monorepo, Docker, Express, Prisma con el **schema completo**, middlewares comunes, autenticación JWT, matriz de permisos, gestión de usuarios y configuración de la iglesia.

> ⚠️ B1 es la ruta crítica de la Fase 0. Las tareas B1-01 a B1-06 deben terminar en la **semana 1**.

## Archivos de tareas
| Archivo | Contenido | Tareas |
|---|---|---|
| [tasks-01-infraestructura.md](tasks-01-infraestructura.md) | Monorepo, Docker, Express, Prisma, middlewares, CI, OpenAPI | B1-01 … B1-07 |
| [tasks-02-auth-usuarios.md](tasks-02-auth-usuarios.md) | Login, refresh, logout, recuperación, permisos, CRUD usuarios | B1-08 … B1-14 |
| [tasks-03-configuracion.md](tasks-03-configuracion.md) | Datos institucionales, logo, horarios | B1-15 … B1-18 |

## Calendario
| Fase | Semana | Tareas |
|---|---|---|
| 0 | 1 | B1-01, B1-02, B1-03, B1-04, B1-05, B1-06 |
| 1 | 2–3 | B1-07, B1-08, B1-09, B1-10, B1-11, B1-12, B1-13 |
| 2 | 4–5 | B1-14, B1-15, B1-16, B1-17 |
| 3 | 7–8 | B1-18, apoyo en integración y revisión de PRs |

## Entregables para otros
- `schema.prisma` + migración inicial (todos los modelos de `specs.md §6`).
- Middlewares `autenticar`, `autorizar(permiso)`, `validar(esquema)`, manejador de errores y `AppError`.
- Helper `paginar()` y formato de respuesta `ok()` / `okLista()`.
- `config/permisos.ts` con la matriz completa.
- Plantilla de módulo (`modules/_plantilla/`) para copiar.

## Riesgos
- Retraso en el schema bloquea a todos → publicar primero el schema aunque falten detalles y corregir con migraciones.
- Cambios en el formato de error/respuesta después de Fase 0 rompen el frontend → congelarlo al cerrar B1-05.
