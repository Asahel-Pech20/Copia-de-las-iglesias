# B2 — Miembros, Ministerios y datos de prueba (Backend)

**Dueño:** Nataly Marisol Santos Miam · **RF:** RF-02, RF-05 · **Par frontend:** [F2](../../frontend/F2-miembros-ministerios/plan.md)

## Objetivo
Implementar la gestión de miembros de la congregación (alta, consulta, edición, búsqueda, filtros, desactivación) y de ministerios (alta, coordinadores, vinculación de miembros, consulta de integrantes). Además, mantener el **seed de datos realistas** que usa todo el equipo.

## Archivos de tareas
| Archivo | Contenido | Tareas |
|---|---|---|
| [tasks-01-miembros.md](tasks-01-miembros.md) | CRUD, búsqueda, filtros, soft delete de miembros | B2-01 … B2-06 |
| [tasks-02-ministerios.md](tasks-02-ministerios.md) | CRUD ministerios, coordinadores, integrantes, seed | B2-07 … B2-12 |

## Calendario
| Fase | Semana | Tareas |
|---|---|---|
| 0 | 1 | Revisar modelos `Miembro`, `Ministerio`, `MiembroMinisterio`, `MinisterioCoordinador` en el PR de B1-03; stubs de rutas |
| 1 | 2–3 | B2-01, B2-02, B2-03, B2-04, B2-05, B2-07 |
| 2 | 4–6 | B2-06, B2-08, B2-09, B2-10, B2-11, B2-12 |
| 3 | 7–8 | Funciones de servicio para reportes (B2-06), pruebas, apoyo a B4 |

## Entregables para otros
- `miembrosService.obtenerActivos()`, `miembrosService.contarActivos()`, `miembrosService.existeActivo(id)` → usados por B3 (asistencia, responsables) y B4 (donaciones, dashboard).
- `ministeriosService.miembrosDe(ministerioId)`, `ministeriosService.ministeriosCoordinadosPor(usuarioId)` → usados por B3 (permisos de coordinador) y B4 (reporte por ministerio).
- Seed con ~60 miembros, 6 ministerios, vínculos y coordinadores (B2-12).

## Riesgos
- Búsqueda lenta con muchos miembros → índice por `apellidos, nombre` y búsqueda `ILIKE` con `unaccent` (o columna normalizada).
- Reglas de "coordinador propio" mal aplicadas → pruebas específicas con usuario COORDINADOR de otro ministerio.
