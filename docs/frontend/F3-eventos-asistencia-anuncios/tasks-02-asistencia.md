# F3 · Tareas 02 — Asistencia

### F3-06 · Selección de evento para pasar lista
- **RF:** RF-03.1, RF-03.2 · **Fase:** 2 · **Tamaño:** S · **Depende de:** F3-05
- `/asistencia`: selector de fecha (default hoy) que lista los eventos de ese día (y botón "Crear evento rápido" tipo CULTO si no hay ninguno y el rol puede). Acceso directo desde el detalle del evento.
- **Criterios de aceptación**
  - [ ] COORDINADOR solo ve eventos de sus ministerios.

### F3-07 · Pase de lista
- **RF:** RF-03.3 · **Fase:** 2 · **Tamaño:** L · **Depende de:** F3-06, B3-07, B3-08
- `/eventos/:id/asistencia`: lista de miembros con interruptor grande Presente/Ausente (táctil, ≥ 44 px), búsqueda, filtros *Todos / Sin marcar / Presentes / Ausentes*, acciones "Marcar todos presentes" y "Marcar restantes como ausentes", contador en vivo. Guardado explícito con botón fijo inferior (`PUT` masivo) y aviso si se sale sin guardar.
- **Criterios de aceptación**
  - [ ] Usable con una mano en 360 px.
  - [ ] Evento cancelado → pantalla bloqueada con mensaje.
  - [ ] Reabrir muestra lo ya guardado.

### F3-08 · Historial de asistencia
- **RF:** RF-03.4 · **Fase:** 3 · **Tamaño:** S · **Depende de:** B3-09
- Pestaña *Historial* en `/asistencia`: tabla filtrable por rango, evento y miembro (`SelectorMiembros`). Hook `useAsistencias()` exportado para F2-04.
- **Criterios de aceptación**
  - [ ] Filtros en la URL.

### F3-09 · Resumen semanal / mensual
- **RF:** RF-03.5 · **Fase:** 3 · **Tamaño:** M · **Depende de:** B3-10
- Pestaña *Resumen*: alternar semanal/mensual, rango, ministerio; gráfica de barras (Recharts) presentes vs. ausentes + tabla con promedio por evento; botón "Exportar" que lleva al reporte de asistencia de F4.
- **Criterios de aceptación**
  - [ ] Tabla alternativa accesible a la gráfica.
