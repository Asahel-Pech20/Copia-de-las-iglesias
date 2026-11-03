# B3 · Tareas 02 — Asistencia

### B3-07 · Lista de asistencia de un evento
- **RF:** RF-03.2, RF-03.3 · **Fase:** 2 · **Tamaño:** M · **Depende de:** B3-03, B2-11
- `GET /eventos/:id/asistencia?q`: si el evento tiene ministerio, lista sus integrantes activos; si no, todos los miembros activos. Cada fila: `miembro { id, nombre, apellidos }`, `presente: true | false | null` (null = sin registrar). Incluye totales `presentes`, `ausentes`, `sinRegistrar`.
- **Criterios de aceptación**
  - [x] Miembros que se registraron en el evento pero ya no están activos siguen apareciendo.

### B3-08 · Registrar asistencia (pase de lista)
- **RF:** RF-03.1, RF-03.3 · **Fase:** 2 · **Tamaño:** M · **Depende de:** B3-07
- `PUT /eventos/:id/asistencia { registros: [{ miembroId, presente }] }`: upsert masivo en transacción con `registradoPorId`. Permiso `asistencia:crear`; COORDINADOR solo en eventos de su ministerio.
- **Criterios de aceptación**
  - [x] Evento `CANCELADO` → 422 `BUSINESS_RULE`.
  - [x] Evento a más de 1 día en el futuro → 422.
  - [x] Reenviar el mismo pase de lista no duplica filas (`@@unique`).
  - [x] 300 registros en < 1 s.

### B3-09 · Historial de asistencia
- **RF:** RF-03.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B3-08
- `GET /asistencias?miembroId&eventoId&desde&hasta` paginado, con datos del evento. Exportar `asistenciaService.porcentajeMiembro(miembroId, meses)` para B2-04.
- **Criterios de aceptación**
  - [x] Filtro por miembro devuelve presentes y ausentes ordenados por fecha desc.

### B3-10 · Resumen semanal y mensual
- **RF:** RF-03.5 · **Fase:** 3 · **Tamaño:** M · **Depende de:** B3-09
- `GET /asistencias/resumen?periodo=semanal|mensual&desde&hasta&ministerioId?` → `[{ periodo: "2026-W43" | "2026-10", eventos, presentes, ausentes, promedioPorEvento }]`. Agrupar con la zona horaria de la configuración. Exportar `asistenciaService.resumenPorPeriodo()`.
- **Criterios de aceptación**
  - [x] Periodos sin datos aparecen con ceros (serie continua para gráficas).
  - [x] Prueba con eventos cerca de medianoche (zona horaria).

### B3-11 · Funciones para reportes y dashboard
- **Fase:** 3 · **Tamaño:** S · **Depende de:** B3-10
- Exportar `asistenciaService.porEvento(eventoId)` (detalle para RF-09.2), `contarRegistradas(desde, hasta)` (RF-08.3) y `participacionPorMinisterio(desde, hasta)` (RF-09.3, con B2-11).
- **Criterios de aceptación**
  - [x] B4 confirma que cubren sus reportes. *(confirmado por B4; para la tabla de eventos del reporte por periodo B4 agregó una consulta de solo lectura en reportes.service.ts)*
