# B4 — Donaciones, Dashboard y Reportes (Backend)

**Dueño:** Oscar Michel Matos May · **RF:** RF-06, RF-08, RF-09 · **Par frontend:** [F4](../../frontend/F4-donaciones-dashboard-reportes/plan.md)

## Objetivo
Implementar el registro auditable de aportaciones (con soporte anónimo y anulación), los resúmenes de ingresos, el endpoint agregado del dashboard y los reportes con exportación a PDF y Excel.

## Archivos de tareas
| Archivo | Contenido | Tareas |
|---|---|---|
| [tasks-01-donaciones.md](tasks-01-donaciones.md) | Registro, consulta, edición, anulación, resúmenes | B4-01 … B4-06 |
| [tasks-02-dashboard.md](tasks-02-dashboard.md) | Endpoint agregado del panel principal | B4-07 … B4-08 |
| [tasks-03-reportes.md](tasks-03-reportes.md) | Exportadores y 4 reportes | B4-09 … B4-14 |

## Calendario
| Fase | Semana | Tareas |
|---|---|---|
| 0 | 1 | Revisar modelo `Donacion`; stub de `/dashboard` con datos fijos (para que F4 avance) |
| 1 | 2–3 | B4-01, B4-02, B4-03, B4-09 (exportadores genéricos, no dependen de nadie) |
| 2 | 4–6 | B4-04, B4-05, B4-06, B4-07, B4-10, B4-13 |
| 3 | 7–8 | B4-08, B4-11, B4-12, B4-14 |

## Dependencias
- B2: `miembrosService.contarActivos`, `altasPorMes`, `listadoParaReporte`, `ministeriosService.contarActivos`, `participacionPorMinisterio`.
- B3: `eventosService.proximos`, `asistenciaService.contarRegistradas`, `resumenPorPeriodo`, `porEvento`, `participacionPorMinisterio`, `anunciosService.vigentes`.
- Mientras esas funciones no existan, usar implementaciones temporales en `dashboard.service.ts` marcadas con `// TODO(B2|B3)` y reemplazarlas en Fase 3.

## Riesgos
- Exposición de datos financieros → prueba automática por cada rol sin `donaciones:leer` contra `/dashboard`, `/donaciones*` y `/reportes/ingresos`.
- Sumas con flotantes → usar `Prisma.Decimal` / `SUM` en SQL; nunca sumar en JS con `number`.
- PDFs lentos con muchos datos → streaming con PDFKit y límite de 5 000 filas.
