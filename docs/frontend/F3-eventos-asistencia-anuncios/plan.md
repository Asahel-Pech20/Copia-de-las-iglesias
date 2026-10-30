# F3 — Calendario, Asistencia, Anuncios y Cartelera (Frontend)

**Dueño:** Genaro Aurelio Antonio Pacheco · **RF:** RF-03, RF-04, RF-07 · **Par backend:** [B3](../../backend/B3-eventos-asistencia-anuncios/plan.md)

## Objetivo
Calendario de eventos con creación/edición/cancelación y responsables; pantalla de pase de lista rápida (pensada para usarse en celular durante el culto); historial y resumen de asistencia; gestión de anuncios; cartelera pública.

## Archivos de tareas
| Archivo | Contenido | Tareas |
|---|---|---|
| [tasks-01-eventos-calendario.md](tasks-01-eventos-calendario.md) | Calendario, formulario, detalle, cancelación | F3-01 … F3-05 |
| [tasks-02-asistencia.md](tasks-02-asistencia.md) | Pase de lista, historial, resumen | F3-06 … F3-09 |
| [tasks-03-anuncios.md](tasks-03-anuncios.md) | Anuncios y cartelera pública | F3-10 … F3-13 |

## Calendario
| Fase | Semana | Tareas |
|---|---|---|
| 0 | 1 | Tipos `Evento`, `Asistencia`, `Anuncio`; handlers MSW |
| 1 | 2–3 | F3-01, F3-02, F3-03 |
| 2 | 4–6 | F3-04, F3-05, F3-06, F3-07, F3-10, F3-11 |
| 3 | 7–8 | F3-08, F3-09, F3-12, F3-13 |

## Entregables para otros
- `useEventos(filtros)`, `useEventosProximos()`, componente `ListaEventos` (usado por F2-11 y F4 dashboard).
- `useAsistencias(filtros)` (usado por F2-04 perfil).
- `TarjetaAnuncio` (usado por F4 dashboard).

## Dependencias
- F1: layout, componentes comunes, `DateRangePicker`, permisos.
- F2: `SelectorMiembros` (responsables) y `useMinisterios()`.

## Riesgos
- FullCalendar en móvil → usar vista *lista* por defecto en < 768 px.
- Pase de lista con muchos miembros → lista virtualizada (`@tanstack/react-virtual`) si hay > 200 filas.
