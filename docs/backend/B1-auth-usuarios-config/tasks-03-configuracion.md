# B1 · Tareas 03 — Configuración de la iglesia

### B1-15 · Datos institucionales
- **RF:** RF-10.1, RF-10.3, RF-10.5 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B1-11
- `GET /configuracion` (público) y `PUT /configuracion` (ADMIN) sobre la fila única `id = 1`: nombre, dirección, ciudad, teléfono, email, sitio web, moneda (ISO 4217), zona horaria (IANA).
- **Criterios de aceptación**
  - [x] Moneda y zona horaria validadas contra listas permitidas.
  - [x] Rol distinto de ADMIN → 403 en `PUT`.

### B1-16 · Logotipo
- **RF:** RF-10.2 · **Fase:** 2 · **Tamaño:** M · **Depende de:** B1-15
- `POST /configuracion/logo` con Multer: png/jpg/webp/svg, ≤ 2 MB, nombre UUID, guarda en `UPLOAD_DIR` y actualiza `logoUrl`. Servir `/uploads` como estático. Borrar el logo anterior al reemplazarlo. SVG: sanitizar o rechazar si contiene `<script>`.
- **Criterios de aceptación**
  - [x] Archivo > 2 MB o tipo no permitido → 400.
  - [x] `logoUrl` accesible desde el frontend.

### B1-17 · Horarios de reuniones
- **RF:** RF-10.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B1-15
- `GET /configuracion/horarios` (público, ordenado por día y hora), `POST`, `PATCH /:id`, `DELETE /:id` (ADMIN). Validar `HH:mm` y `horaFin > horaInicio`.
- **Criterios de aceptación**
  - [x] Pruebas de validación de horas y de orden del listado.

### B1-18 · Endurecimiento y revisión final
- **Fase:** 3 · **Tamaño:** M · **Depende de:** todas las de B1
- Revisar que **todas** las rutas de B2–B4 usan `autenticar` + `autorizar` (prueba automática que recorre el router y falla si una ruta no pública carece de ellos). Revisar logs sin datos sensibles.
- **Criterios de aceptación**
  - [x] Prueba de "rutas protegidas" en verde.
  - [x] Checklist de seguridad de `AGENTS.md §3` verificada.
