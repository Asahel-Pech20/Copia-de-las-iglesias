# F4 · Tareas 02 — Dashboard (panel principal)

### F4-06 · Indicadores principales
- **RF:** RF-08.1, RF-08.3, RF-08.4, RF-08.5 · **Fase:** 1 · **Tamaño:** M · **Depende de:** F1-06 (`StatCard`), B4-07 (o MSW)
- Ruta `/` con saludo ("Buenos días, {nombre}") y fila de `StatCard`: miembros activos, asistencias del mes (con la de la semana como subtítulo), ministerios, e **ingresos del mes** con variación vs. mes anterior — esta última solo si la respuesta trae `ingresos`. Cada tarjeta enlaza a su módulo.
- **Criterios de aceptación**
  - [ ] Prueba con mock sin `ingresos`: la tarjeta no se renderiza ni deja hueco.
  - [ ] Skeletons durante la carga.

### F4-07 · Gráficas estadísticas
- **RF:** RF-08.6 · **Fase:** 2 · **Tamaño:** M · **Depende de:** F4-06
- Recharts con colores de tokens: asistencia semanal (líneas/barras, 12 semanas), miembros por ministerio (barras horizontales), altas de miembros por mes, e ingresos por mes (solo si hay `ingresos`). Tooltips en español, ejes con formato, responsive.
- **Criterios de aceptación**
  - [ ] Cada gráfica con título, descripción textual corta y opción "Ver como tabla".
  - [ ] Se ve bien en modo oscuro.

### F4-08 · Widgets de eventos y avisos
- **RF:** RF-08.2, RF-07.4 · **Fase:** 3 · **Tamaño:** S · **Depende de:** F4-06, F3-05, F3-12
- Columna lateral (o sección inferior en móvil) con `ListaEventos` (5 próximos) y `TarjetaAnuncio` compacta (avisos importantes), con enlaces "Ver todos".
- **Criterios de aceptación**
  - [ ] Layout del dashboard sin scroll horizontal en 360 px.
