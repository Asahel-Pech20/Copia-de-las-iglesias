# B4 · Tareas 03 — Reportes y exportación

> Todos los reportes aceptan `?formato=json|pdf|xlsx` (default `json`). El JSON es lo que el frontend muestra en pantalla; PDF/XLSX se descargan.

### B4-09 · Exportadores genéricos
- **RF:** RF-09.5 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B1-05
- `lib/exportadores/`: `aPdf({ titulo, subtitulo, columnas, filas, totales? })` con PDFKit (encabezado con nombre y logo de la iglesia, fecha de generación, usuario, paginación "Página X de Y") y `aExcel(...)` con ExcelJS (encabezado en negrita, anchos automáticos, formatos de fecha y moneda, fila de totales). Helper `responderReporte(res, formato, datos, nombreArchivo)`.
- **Criterios de aceptación**
  - [ ] Nombre de archivo `reporte-<tipo>-YYYY-MM-DD.<ext>`.
  - [ ] Acentos y ñ se ven bien en PDF (fuente embebida).
  - [ ] Pruebas que validan `Content-Type` y que el archivo no está vacío.

### B4-10 · Reporte de ingresos por periodo
- **RF:** RF-09.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B4-05, B4-09
- `GET /reportes/ingresos?desde&hasta&agrupar` usando `donacionesService.resumen()` + detalle de aportaciones. Permiso `reportes:ingresos` (ADMIN, PASTOR, TESORERO). En el detalle, las anónimas muestran "Anónimo".
- **Criterios de aceptación**
  - [ ] SECRETARIO y COORDINADOR → 403.

### B4-11 · Reporte general de miembros
- **RF:** RF-09.1 · **Fase:** 3 · **Tamaño:** S · **Depende de:** B2-06, B4-09
- `GET /reportes/miembros?estado` → columnas: nombre completo, teléfono, correo, fecha de ingreso, estado, ministerios. Totales: activos, inactivos, altas del año.
- **Criterios de aceptación**
  - [ ] TESORERO → 403 (según matriz).

### B4-12 · Reporte de asistencia por evento
- **RF:** RF-09.2, RF-03.5 · **Fase:** 3 · **Tamaño:** M · **Depende de:** B3-10, B3-11, B4-09
- `GET /reportes/asistencia?eventoId` → detalle de presentes/ausentes del evento. `GET /reportes/asistencia?desde&hasta&periodo=semanal|mensual` → tabla de eventos con totales y `resumenPorPeriodo` (reporte semanal/mensual). COORDINADOR solo eventos de sus ministerios.
- **Criterios de aceptación**
  - [ ] Porcentaje de asistencia por evento con 1 decimal.

### B4-13 · Reporte de participación por ministerio
- **RF:** RF-09.3 · **Fase:** 2 · **Tamaño:** M · **Depende de:** B2-11, B3-11, B4-09
- `GET /reportes/ministerios?ministerioId&desde&hasta` → por ministerio: integrantes activos, coordinadores, eventos realizados, promedio de asistencia de sus integrantes. Con `ministerioId`: lista de integrantes y su % de asistencia.
- **Criterios de aceptación**
  - [ ] COORDINADOR solo ve sus ministerios.

### B4-14 · Pruebas de seguridad financiera
- **RF:** RF-06.5, RF-08.5 · **Fase:** 3 · **Tamaño:** S · **Depende de:** B4-07, B4-10
- Suite que, para cada rol, llama a todos los endpoints con datos financieros y verifica 403 o ausencia de la clave `ingresos`.
- **Criterios de aceptación**
  - [ ] Suite en CI y en verde.
