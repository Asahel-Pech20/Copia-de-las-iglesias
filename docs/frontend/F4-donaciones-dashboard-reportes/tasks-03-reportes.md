# F4 · Tareas 03 — Centro de reportes

### F4-09 · Centro de reportes y descarga
- **RF:** RF-09.5 · **Fase:** 2 · **Tamaño:** M · **Depende de:** F1-06, B4-09
- `/reportes`: tarjetas por reporte (Miembros, Asistencia, Ministerios, Ingresos) filtradas por permisos. Hook `useDescargarReporte(tipo, filtros, formato)` que pide el archivo como `blob`, respeta el `filename` de `Content-Disposition` y muestra progreso/errores.
- **Criterios de aceptación**
  - [ ] TESORERO solo ve *Ingresos*; SECRETARIO no ve *Ingresos*.
  - [ ] Botón deshabilitado mientras descarga.

### F4-10 · Vistas previas de reportes
- **RF:** RF-09.1, RF-09.2, RF-09.3, RF-09.4 · **Fase:** 3 · **Tamaño:** L · **Depende de:** F4-09, B4-10 … B4-13
- Una página por reporte con sus filtros y vista previa (`formato=json`) en `DataTable` + totales, y botones **PDF** y **Excel**:
  - *Miembros*: estado.
  - *Asistencia*: por evento (selector de evento) o por periodo (rango + semanal/mensual).
  - *Ministerios*: ministerio opcional + rango.
  - *Ingresos*: rango + agrupación.
- **Criterios de aceptación**
  - [ ] Los filtros de la vista previa son exactamente los que se envían a la descarga.
  - [ ] Filtros en la URL (se pueden compartir enlaces).

### F4-11 · Accesos directos a reportes
- **RF:** RF-09 · **Fase:** 3 · **Tamaño:** S · **Depende de:** F4-10
- Botones "Exportar" en listados de miembros (F2), resumen de asistencia (F3-09), ministerio (F2-10) y donaciones (F4-01) que abren el reporte con los filtros actuales. Coordinar con F2/F3 (ellos colocan el botón, F4 provee `<BotonExportar tipo filtros />`).
- **Criterios de aceptación**
  - [ ] Componente `BotonExportar` reutilizable con menú PDF / Excel.
