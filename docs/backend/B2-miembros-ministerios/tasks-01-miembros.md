# B2 · Tareas 01 — Miembros

### B2-01 · Registrar miembro
- **RF:** RF-02.1, RF-02.4 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B1-05, B1-11
- `POST /miembros`. Obligatorios: `nombre`, `apellidos`, `fechaIngreso`. Opcionales: `telefono`, `email`, `fechaNacimiento`, `direccion`, `notas`. Permiso `miembros:crear`.
- **Criterios de aceptación**
  - [x] Email con formato válido (si viene); teléfono 7–15 dígitos (se permite `+`, espacios y guiones, se guarda normalizado).
  - [x] `fechaIngreso` no futura.
  - [x] Advertencia (no error) si ya existe un miembro con mismo nombre y apellidos: `meta.posibleDuplicado = true`.

### B2-02 · Listado paginado
- **RF:** RF-02.2 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B2-01
- `GET /miembros?page&limit&orden`. Orden por defecto `apellidos:asc`. Incluye conteo de ministerios activos por miembro.
- **Criterios de aceptación**
  - [x] Respuesta con `meta` de paginación.
  - [x] TESORERO y COORDINADOR pueden leer; sin token → 401.

### B2-03 · Búsqueda por nombre y filtros
- **RF:** RF-02.5, RF-02.6 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B2-02
- `?q=` busca en nombre + apellidos, sin distinguir mayúsculas ni acentos. `?estado=activo|inactivo|todos` (default `activo`). `?ministerioId=` filtra integrantes.
- **Criterios de aceptación**
  - [x] "jose" encuentra "José".
  - [x] Prueba combinando `q` + `estado` + `ministerioId`.

### B2-04 · Detalle y edición
- **RF:** RF-02.3 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B2-01
- `GET /miembros/:id` (incluye ministerios y resumen: último evento asistido, % asistencia últimos 3 meses — este último vía `asistenciaService` de B3 cuando exista; antes, omitir). `PATCH /miembros/:id` con las mismas validaciones.
- **Criterios de aceptación**
  - [x] Id inexistente → 404.
  - [x] No se puede cambiar `activo` por este endpoint (se ignora / 400 por `.strict()`).

### B2-05 · Desactivar / reactivar
- **RF:** RF-02.7 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B2-04
- `PATCH /miembros/:id/estado { activo, motivo? }`. Al desactivar: guarda `fechaBaja`, `motivoBaja` y desactiva sus vínculos de ministerio (`MiembroMinisterio.activo = false`, `fechaSalida`). Al reactivar: limpia `fechaBaja`/`motivoBaja` (los vínculos no se restauran solos).
- **Criterios de aceptación**
  - [x] No existe `DELETE /miembros/:id`.
  - [x] Historial de asistencia y donaciones del miembro se conserva.
  - [x] Operación en transacción.

### B2-06 · Funciones de servicio para otros módulos
- **Fase:** 2 · **Tamaño:** S · **Depende de:** B2-05
- Exportar `contarActivos()`, `obtenerActivos(filtros)`, `existeActivo(id)`, `altasPorMes(desde, hasta)` y `listadoParaReporte(filtros)` (sin paginar) para B3 y B4. Documentar en `miembros.service.ts`.
- **Criterios de aceptación**
  - [x] Pruebas unitarias de cada función.
  - [ ] B4 confirma que le sirven para dashboard y reporte general.
