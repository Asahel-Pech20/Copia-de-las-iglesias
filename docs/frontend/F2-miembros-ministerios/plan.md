# F2 — Miembros, Ministerios y Selector de miembros (Frontend)

**Dueño:** Nataly Marisol Santos Miam · **RF:** RF-02, RF-05 · **Par backend:** [B2](../../backend/B2-miembros-ministerios/plan.md)

## Objetivo
Pantallas para gestionar miembros (listado con búsqueda y filtros, alta, edición, perfil, desactivación) y ministerios (listado, alta/edición, coordinadores, integrantes, actividades). Además, el componente reutilizable **`SelectorMiembros`** que usan F3 y F4.

## Archivos de tareas
| Archivo | Contenido | Tareas |
|---|---|---|
| [tasks-01-miembros.md](tasks-01-miembros.md) | Listado, formulario, perfil, desactivación, selector | F2-01 … F2-06 |
| [tasks-02-ministerios.md](tasks-02-ministerios.md) | Listado, formulario, detalle con integrantes y actividades | F2-07 … F2-11 |

## Calendario
| Fase | Semana | Tareas |
|---|---|---|
| 0 | 1 | Tipos `Miembro`, `Ministerio` en `src/types/`; handlers MSW de miembros y ministerios |
| 1 | 2–3 | F2-01, F2-02, F2-03, F2-06 (selector, lo necesitan F3/F4) |
| 2 | 4–6 | F2-04, F2-05, F2-07, F2-08, F2-09, F2-10 |
| 3 | 7–8 | F2-11, pruebas, pulido |

## Entregables para otros
- `features/miembros/components/SelectorMiembros.tsx`: búsqueda asíncrona, selección simple o múltiple, filtra por ministerio opcional, solo activos por defecto.
- `useMiembro(id)`, `useMinisterios()` para selects de otros módulos.

## Dependencias
- F1: layout, `DataTable`, `FormField`, `ConfirmDialog`, `useFiltrosURL`, permisos.
- F3: `useEventos({ ministerioId })` para las actividades del ministerio (F2-11) e historial de asistencia en el perfil (F2-05).
