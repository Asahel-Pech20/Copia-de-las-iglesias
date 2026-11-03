# Índice de trabajo — AppIglesia

Lectura obligatoria antes de empezar: [requisitos.md](requisitos.md) (revisa tu laptop con `node scripts/verificar-equipo.mjs`) → [CLAUDE.md](../CLAUDE.md) → [AGENTS.md](../AGENTS.md) → [specs.md](../specs.md).

## Cómo usar esta carpeta
1. Busca tu subsección en la tabla (cada integrante tiene una subsección de backend y su par de frontend).
2. Lee su `plan.md` (objetivo, calendario, entregables, dependencias).
3. Toma las tareas en orden de fase desde los `tasks-*.md`. Crea la rama `feat/<ID>-<descripcion>`.
4. Al fusionar el PR, marca los checkboxes de la tarea en el mismo PR.

Formato de cada tarea: **ID · Título**, RF, fase, tamaño (S ≈ ½ día, M ≈ 1–2 días, L ≈ 3–4 días), dependencias, descripción y criterios de aceptación.

## Asignación
| Integrante | Backend | Frontend |
|---|---|---|
| Santiago Asahel Pech Ake | [B1 · Infraestructura, Auth, Usuarios, Configuración](backend/B1-auth-usuarios-config/plan.md) — 18 tareas | [F1 · Base UI, Layout, Auth, Usuarios, Configuración](frontend/F1-base-auth-config/plan.md) — 16 tareas |
| Nataly Marisol Santos Miam | [B2 · Miembros, Ministerios, Seed](backend/B2-miembros-ministerios/plan.md) — 12 tareas | [F2 · Miembros, Ministerios, SelectorMiembros](frontend/F2-miembros-ministerios/plan.md) — 11 tareas |
| Genaro Aurelio Antonio Pacheco | [B3 · Eventos, Asistencia, Anuncios, Cartelera](backend/B3-eventos-asistencia-anuncios/plan.md) — 15 tareas | [F3 · Calendario, Asistencia, Anuncios, Cartelera](frontend/F3-eventos-asistencia-anuncios/plan.md) — 13 tareas |
| Oscar Michel Matos May | [B4 · Donaciones, Dashboard, Reportes](backend/B4-donaciones-dashboard-reportes/plan.md) — 14 tareas | [F4 · Donaciones, Dashboard, Reportes](frontend/F4-donaciones-dashboard-reportes/plan.md) — 11 tareas |

## Auditorías
Las revisiones del avance están en [Auditorias/](../Auditorias/). Cada una tiene un índice (`Auditoria_<n>/README.md`) y un archivo de observaciones por integrante y capa: `<Integrante>/backend/observaciones.md` y `<Integrante>/frontend/observaciones.md`. Atiende las tuyas en una rama `fix/<subseccion>-auditoria<n>-<id>` y marca su casilla en el mismo PR.

| Auditoría | Fecha | Índice |
|---|---|---|
| 1 | 2026-11-02 | [Auditoria_1/README.md](../Auditorias/Auditoria_1/README.md) |

## Estructura
```
docs/
├── backend/
│   ├── B1-auth-usuarios-config/        plan.md · tasks-01-infraestructura · tasks-02-auth-usuarios · tasks-03-configuracion
│   ├── B2-miembros-ministerios/        plan.md · tasks-01-miembros · tasks-02-ministerios
│   ├── B3-eventos-asistencia-anuncios/ plan.md · tasks-01-eventos · tasks-02-asistencia · tasks-03-anuncios
│   └── B4-donaciones-dashboard-reportes/ plan.md · tasks-01-donaciones · tasks-02-dashboard · tasks-03-reportes
└── frontend/
    ├── F1-base-auth-config/            plan.md · tasks-01-base-ui · tasks-02-auth-usuarios · tasks-03-configuracion
    ├── F2-miembros-ministerios/        plan.md · tasks-01-miembros · tasks-02-ministerios
    ├── F3-eventos-asistencia-anuncios/ plan.md · tasks-01-eventos-calendario · tasks-02-asistencia · tasks-03-anuncios
    └── F4-donaciones-dashboard-reportes/ plan.md · tasks-01-donaciones · tasks-02-dashboard · tasks-03-reportes
```

## Trazabilidad RF → tareas
| RF | Backend | Frontend |
|---|---|---|
| RF-01 Usuarios y sesión | B1-08 … B1-14 | F1-08 … F1-13 |
| RF-02 Miembros | B2-01 … B2-06 | F2-01 … F2-06 |
| RF-03 Asistencia | B3-07 … B3-11 | F3-06 … F3-09 |
| RF-04 Eventos | B3-01 … B3-06 | F3-01 … F3-05 |
| RF-05 Ministerios | B2-07 … B2-11 | F2-05, F2-07 … F2-11 |
| RF-06 Donaciones | B4-01 … B4-06 | F4-01 … F4-05 |
| RF-07 Anuncios | B3-12 … B3-15 | F3-10 … F3-13 |
| RF-08 Dashboard | B4-07, B4-08 | F4-06 … F4-08 |
| RF-09 Reportes | B4-09 … B4-14 | F4-09 … F4-11 |
| RF-10 Configuración | B1-15 … B1-17 | F1-14 … F1-16 |

## Hitos de integración (todo el equipo)
| Semana | Hito |
|---|---|
| 1 | Schema Prisma aprobado por los 4 · layout y componentes base publicados |
| 3 | Login real + CRUD de miembros end-to-end (sin MSW) |
| 6 | Todos los módulos end-to-end; MSW solo en pruebas |
| 8 | Demo completa con seed, reportes descargables y cartelera pública |
