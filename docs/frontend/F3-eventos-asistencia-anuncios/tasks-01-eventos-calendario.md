# F3 · Tareas 01 — Eventos y calendario

### F3-01 · Calendario de eventos
- **RF:** RF-04.5 · **Fase:** 1 · **Tamaño:** L · **Depende de:** F1-03, B3-02 (o MSW)
- `/eventos`: FullCalendar (locale `es`, semana inicia domingo/lunes según configuración) con vistas *Mes*, *Semana*, *Lista*; carga por rango visible (`desde`/`hasta`). Colores por categoría (tokens), cancelados tachados y en gris. Filtros: tipo, categoría, ministerio, mostrar cancelados. Clic en evento → detalle; clic en día vacío → nuevo evento con fecha precargada (si tiene permiso).
- **Criterios de aceptación**
  - [x] En móvil la vista por defecto es *Lista*.
  - [x] Leyenda de colores visible y accesible (no solo color: ícono o texto).

### F3-02 · Formulario de evento
- **RF:** RF-04.1, RF-04.2 · **Fase:** 1 · **Tamaño:** M · **Depende de:** F1-07, B3-01
- Crear/editar (página o `Sheet` lateral): título, tipo, categoría, fecha, hora inicio, hora fin, lugar (sugerencias con lugares de horarios configurados), descripción, ministerio. COORDINADOR solo puede elegir sus ministerios (campo obligatorio para él).
- **Criterios de aceptación**
  - [x] Validación fin ≥ inicio en el formulario.
  - [x] Acepta `?fecha=` y `?ministerioId=` para precargar.

### F3-03 · Detalle del evento
- **RF:** RF-04.2, RF-04.3 · **Fase:** 1 · **Tamaño:** S · **Depende de:** F3-02, B3-03
- `/eventos/:id`: datos, estado, ministerio, responsables, resumen de asistencia y acciones (Editar, Cancelar, Pasar lista) según permisos y estado.
- **Criterios de aceptación**
  - [x] Evento cancelado muestra motivo y oculta Editar / Pasar lista.

### F3-04 · Responsables
- **RF:** RF-04.3 · **Fase:** 2 · **Tamaño:** S · **Depende de:** F3-03, F2-06, B3-05
- En el detalle (y opcional en el formulario): `SelectorMiembros` múltiple (máx. 10) para editar responsables.
- **Criterios de aceptación**
  - [x] Error 422 indica qué miembro no es válido.

### F3-05 · Cancelar evento y lista reutilizable
- **RF:** RF-04.4, RF-07.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** F3-03, B3-04, B3-06
- `ConfirmDialog` con motivo obligatorio. Componente `ListaEventos` (compacto, para dashboard y ministerio) y hooks `useEventos`, `useEventosProximos`.
- **Criterios de aceptación**
  - [x] Tras cancelar, el calendario se actualiza sin recargar.
