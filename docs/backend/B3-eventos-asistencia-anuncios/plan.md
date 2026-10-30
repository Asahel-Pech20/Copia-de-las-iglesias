# B3 — Eventos, Asistencia, Anuncios y Cartelera pública (Backend)

**Dueño:** Genaro Aurelio Antonio Pacheco · **RF:** RF-03, RF-04, RF-07 · **Par frontend:** [F3](../../frontend/F3-eventos-asistencia-anuncios/plan.md)

## Objetivo
Implementar eventos (creación, responsables, edición, cancelación, consulta por rango para calendario), registro y consulta de asistencia por evento, resúmenes semanales/mensuales de asistencia, anuncios y el endpoint público de cartelera.

## Archivos de tareas
| Archivo | Contenido | Tareas |
|---|---|---|
| [tasks-01-eventos.md](tasks-01-eventos.md) | CRUD eventos, responsables, cancelación, rango para calendario | B3-01 … B3-06 |
| [tasks-02-asistencia.md](tasks-02-asistencia.md) | Pase de lista, historial, resúmenes | B3-07 … B3-11 |
| [tasks-03-anuncios.md](tasks-03-anuncios.md) | Anuncios y cartelera pública | B3-12 … B3-15 |

## Calendario
| Fase | Semana | Tareas |
|---|---|---|
| 0 | 1 | Revisar modelos `Evento`, `EventoResponsable`, `Asistencia`, `Anuncio`; stubs de rutas |
| 1 | 2–3 | B3-01, B3-02, B3-03, B3-04 |
| 2 | 4–6 | B3-05, B3-06, B3-07, B3-08, B3-09, B3-12, B3-13, B3-14 |
| 3 | 7–8 | B3-10, B3-11, B3-15, pruebas e integración con B4 |

## Entregables para otros
- `eventosService.proximos(limit)`, `eventosService.contarPorRango()` → dashboard (B4).
- `asistenciaService.resumenPorPeriodo(periodo, desde, hasta)`, `asistenciaService.porEvento(eventoId)`, `asistenciaService.porcentajeMiembro(miembroId, meses)` → dashboard, reportes (B4) y detalle de miembro (B2).
- `anunciosService.vigentes({ soloImportantes })` → dashboard (B4).

## Dependencias
- B2: `miembrosService.existeActivo`, `obtenerActivos`, `ministeriosService.miembrosDe`, `ministeriosCoordinadosPor`.
- B1: `esCoordinadorDe()` para reglas de COORDINADOR.

## Riesgos
- Zonas horarias en el calendario → guardar en UTC y convertir con `zonaHoraria` de la configuración en resúmenes por día/semana (`date_trunc` con `AT TIME ZONE`).
- Pase de lista grande (cientos de miembros) → upsert masivo en una transacción, no N peticiones.
