# F4 · Tareas 01 — Donaciones y aportaciones

### F4-01 · Listado de aportaciones
- **RF:** RF-06.3, RF-06.5 · **Fase:** 1 · **Tamaño:** M · **Depende de:** F1-06, B4-02 (o MSW)
- `/donaciones` (permiso `donaciones:leer`): `DateRangePicker` (default mes actual, atajos *Este mes*, *Mes anterior*, *Este año*), filtros concepto, método, donante, "Solo anónimas", "Incluir anuladas". Tabla: fecha, donante ("Anónimo" si aplica), concepto, método, monto (alineado a la derecha), estado. Total del filtro (`meta.totalMonto`) destacado arriba.
- **Criterios de aceptación**
  - [ ] Anuladas se muestran tachadas con badge "Anulada".
  - [ ] SECRETARIO que escribe la URL ve 403.

### F4-02 · Registrar aportación
- **RF:** RF-06.1, RF-06.2, RF-06.6 · **Fase:** 1 · **Tamaño:** M · **Depende de:** F1-07, F2-06, B4-01
- Formulario (modal o página) optimizado para captura rápida: fecha (default hoy), monto (`CampoMoneda`), concepto, detalle (visible si `OTRO`), método, interruptor **"Aportación anónima"** que oculta y limpia el `SelectorMiembros`, referencia, notas. Opción "Guardar y registrar otra".
- **Criterios de aceptación**
  - [ ] No se puede enviar anónima con donante seleccionado.
  - [ ] PASTOR (solo lectura) no ve el botón "Registrar".

### F4-03 · Detalle, edición y anulación
- **RF:** RF-06.2, RF-06.5 · **Fase:** 2 · **Tamaño:** S · **Depende de:** F4-02, B4-03, B4-04
- Panel de detalle con auditoría (registrado por / editado por / anulado por, fechas). Editar con el mismo formulario. "Anular" con `ConfirmDialog` y motivo obligatorio. No existe "Eliminar".
- **Criterios de aceptación**
  - [ ] Una anulada no muestra Editar ni Anular.

### F4-04 · Resumen de ingresos por periodo
- **RF:** RF-06.3 · **Fase:** 2 · **Tamaño:** M · **Depende de:** B4-05
- Pestaña *Resumen* en `/donaciones`: rango + agrupación (día/semana/mes/concepto/método). Gráfica de barras (temporal) o dona (concepto/método) + tabla con totales.
- **Criterios de aceptación**
  - [ ] Tabla alternativa accesible; montos formateados con la moneda configurada.

### F4-05 · Resumen mensual
- **RF:** RF-06.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B4-06
- Tarjeta/página con selector mes-año: total, variación vs. mes anterior (flecha y color), desglose por concepto y método, anónimas vs. identificadas; botón "Descargar PDF" (reporte de ingresos del mes).
- **Criterios de aceptación**
  - [ ] Variación `null` muestra "Sin datos del mes anterior".
