# B3 · Tareas 01 — Eventos

### B3-01 · Crear evento
- **RF:** RF-04.1, RF-04.2 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B1-11
- `POST /eventos`: `titulo`, `tipo` (RELIGIOSO/ADMINISTRATIVO), `categoria` (CULTO/REUNION/ACTIVIDAD/OTRO), `fechaInicio`, `fechaFin?`, `lugar`, `descripcion?`, `ministerioId?`. `creadoPorId` = usuario actual. COORDINADOR solo puede crear con `ministerioId` de un ministerio que coordina.
- **Criterios de aceptación**
  - [ ] `fechaFin < fechaInicio` → 400.
  - [ ] COORDINADOR sin `ministerioId` o de otro ministerio → 403.
  - [ ] Ministerio inactivo → 422.

### B3-02 · Consultar eventos por rango (calendario)
- **RF:** RF-04.5 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B3-01
- `GET /eventos?desde&hasta&tipo&categoria&estado&ministerioId`. Si vienen `desde`/`hasta` se devuelve sin paginar (máx. 500 eventos, rango ≤ 93 días) para el calendario; si no, paginado y ordenado por `fechaInicio desc`.
- **Criterios de aceptación**
  - [ ] Rango > 93 días → 400.
  - [ ] Incluye eventos que empiezan antes de `desde` pero terminan dentro del rango.
  - [ ] Cada evento incluye `ministerio { id, nombre }` y `totalResponsables`.

### B3-03 · Detalle y edición
- **RF:** RF-04.4 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B3-01
- `GET /eventos/:id` (con responsables, ministerio, creador y `resumenAsistencia` si existe). `PATCH /eventos/:id` con mismas validaciones. COORDINADOR solo edita eventos de su ministerio.
- **Criterios de aceptación**
  - [ ] No se edita un evento `CANCELADO` → 422.

### B3-04 · Cancelar evento
- **RF:** RF-04.4 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B3-03
- `PATCH /eventos/:id/cancelar { motivo }` (motivo 5–300 caracteres). Cambia `estado = CANCELADO`. No hay `DELETE`.
- **Criterios de aceptación**
  - [ ] Evento ya cancelado → 422.
  - [ ] Asistencia registrada se conserva (no se borra).

### B3-05 · Asignar responsables
- **RF:** RF-04.3 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B3-03, B2-06
- `PUT /eventos/:id/responsables { miembroIds[] }` reemplaza la lista (máx. 10). Solo miembros activos.
- **Criterios de aceptación**
  - [ ] Miembro inactivo o inexistente → 422 indicando cuál.

### B3-06 · Próximos eventos y estado REALIZADO
- **RF:** RF-07.4, RF-08.2 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B3-02
- `GET /eventos/proximos?limit=5` (programados desde ahora). Exportar `eventosService.proximos()`. Al registrar asistencia de un evento pasado, marcarlo `REALIZADO`; job simple (al consultar o con `node-cron` diario) que marca `REALIZADO` los programados cuya fecha ya pasó.
- **Criterios de aceptación**
  - [ ] Pruebas de cambio automático de estado.
