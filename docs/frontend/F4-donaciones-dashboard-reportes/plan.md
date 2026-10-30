# F4 — Donaciones, Dashboard y Reportes (Frontend)

**Dueño:** Oscar Michel Matos May · **RF:** RF-06, RF-08, RF-09 · **Par backend:** [B4](../../backend/B4-donaciones-dashboard-reportes/plan.md)

## Objetivo
Pantallas de registro y consulta de aportaciones (incluidas anónimas y anulaciones), resumen de ingresos, el panel principal (dashboard) con indicadores y gráficas, y el centro de reportes con descarga en PDF/Excel.

## Archivos de tareas
| Archivo | Contenido | Tareas |
|---|---|---|
| [tasks-01-donaciones.md](tasks-01-donaciones.md) | Listado, registro, edición, anulación, resúmenes | F4-01 … F4-05 |
| [tasks-02-dashboard.md](tasks-02-dashboard.md) | Indicadores, gráficas, widgets | F4-06 … F4-08 |
| [tasks-03-reportes.md](tasks-03-reportes.md) | Centro de reportes, vista previa y descarga | F4-09 … F4-11 |

## Calendario
| Fase | Semana | Tareas |
|---|---|---|
| 0 | 1 | Tipos `Donacion`, `Dashboard`, `Reporte*`; handlers MSW (incluye dashboard con y sin `ingresos`) |
| 1 | 2–3 | F4-01, F4-02, F4-06 (con MSW) |
| 2 | 4–6 | F4-03, F4-04, F4-05, F4-07, F4-09 |
| 3 | 7–8 | F4-08, F4-10, F4-11 |

## Dependencias
- F1: componentes comunes, `CampoMoneda`, `StatCard`, `DateRangePicker`, permisos, `useConfiguracion` (moneda).
- F2: `SelectorMiembros` (donante).
- F3: `ListaEventos`, `TarjetaAnuncio` (dashboard).
- Paleta y estilo de gráficas: solo tokens de `AGENTS.md §4`.

## Riesgos
- Mostrar datos financieros a quien no debe → todas las rutas de donaciones con `<RutaProtegida permiso="donaciones:leer">` y el dashboard renderiza la sección de ingresos **solo** si la clave existe en la respuesta.
- Montos: nunca convertir a `number` para sumar en el cliente; mostrar los strings del backend con `formatearMoneda`.
