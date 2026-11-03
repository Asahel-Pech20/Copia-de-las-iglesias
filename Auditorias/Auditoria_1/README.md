# Auditoría 1 — AppIglesia

- **Fecha:** 2026-11-02
- **Rama auditada:** `feat/B4-F4-donaciones-dashboard-reportes`. Incluye `develop` hasta el PR #7, B4 en `1e7220b` y F4 todavía **sin commitear**.
- **Fuera de alcance:** el PR #8 (`feat/F2-11-asistencia-actividades`, F2) sigue abierto y no se auditó.
- **Referencias:** `AGENTS.md` (reglas), `specs.md` §3, §6 y §7 (contrato) y los `tasks-*.md` de cada subsección.

## Cómo usar esta carpeta

Cada integrante (o su agente) lee **solo** su archivo: `<Integrante>/backend/observaciones.md` o `<Integrante>/frontend/observaciones.md`. Cada archivo se entiende solo y cita el archivo y la línea exactos. No hace falta releer todo el repositorio.

Al atender una observación:
1. Corrígela en una rama `fix/<subseccion>-auditoria1-<id>` (por ejemplo, `fix/B3-auditoria1-02`).
2. En el mismo PR, marca su casilla en la tabla de tu archivo.
3. Si no la vas a corregir, explica el motivo en la columna «Estado».

| Carpeta | Integrante | Backend | Frontend |
|---|---|---|---|
| [Santiago_Pech_Ake_B1-F1](Santiago_Pech_Ake_B1-F1/) | Santiago Asahel Pech Ake | B1 · 3 obs. | F1 · 4 obs. |
| [Nataly_Santos_Miam_B2-F2](Nataly_Santos_Miam_B2-F2/) | Nataly Marisol Santos Miam | B2 · 2 obs. | F2 · 4 obs. |
| [Genaro_Antonio_Pacheco_B3-F3](Genaro_Antonio_Pacheco_B3-F3/) | Genaro Aurelio Antonio Pacheco | B3 · 3 obs. | F3 · 3 obs. |
| [Oscar_Matos_May_B4-F4](Oscar_Matos_May_B4-F4/) | Oscar Michel Matos May | B4 · 5 obs. | F4 · 6 obs. |

## Severidad

| Nivel | Significado |
|---|---|
| **Alta** | Rompe una regla de oro de `AGENTS.md` §1, expone datos o da un resultado incorrecto. Se corrige antes de fusionar a `main`. |
| **Media** | Incumple una regla de `AGENTS.md` o un criterio de aceptación, sin riesgo inmediato. Se corrige en la fase actual. |
| **Baja** | Mejora de calidad, UX o mantenimiento. Se puede programar. |
| **Info** | Coordinación entre integrantes o pendiente de documentación. |

**Resultado:** no hay observaciones de severidad Alta. La autorización, la omisión de datos financieros, el soft delete y el formato del dinero se cumplen en todos los módulos.

## Verificación automática (ejecutada en esta auditoría)

| Verificación | Resultado |
|---|---|
| `pnpm lint` | ✅ sin errores |
| `pnpm typecheck` (backend + frontend) | ✅ |
| `pnpm format:check` | ✅ |
| `pnpm --filter backend test` (PostgreSQL 16 temporal, puerto 5433) | ✅ 23 archivos, **371 pruebas** |
| `pnpm --filter frontend test` | ✅ 16 archivos, **184 pruebas** |
| Rutas protegidas: todas las rutas pasan por `autenticar` + `autorizar*`, salvo las públicas del contrato (`/auth/*`, `GET /configuracion*`, `/public/cartelera`) | ✅ |
| Matriz de permisos: `backend/src/config/permisos.ts` comparada con `frontend/src/lib/permisos.ts` | ✅ idénticas |
| `passwordHash` solo en `auth.service` y `usuarios.service` (para verificar contraseñas); nunca se serializa | ✅ |
| `any`, `@ts-ignore`, `eslint-disable` y `console.log` en el frontend | ✅ ninguno |
| Íconos que no son de `lucide-react` | ✅ ninguno |

## Revisión visual (navegador integrado, con mocks MSW)

Revisé `/`, `/donaciones` y `/reportes?tipo=ingresos`:
- **360 px:** sin scroll horizontal (`scrollWidth = clientWidth = 360`).
- **Modo oscuro:** los colores de los tokens se ven correctos.
- **1024 px:** encontré un problema de layout en el dashboard (ver F4).

## Lo que no se verificó

- El frontend contra el **backend real**: todo el frontend se probó con mocks.
- Lighthouse (F3-13).
- El PDF a ojo: solo se extrajo su texto.
- El tiempo del dashboard con el seed completo (B4-07).
