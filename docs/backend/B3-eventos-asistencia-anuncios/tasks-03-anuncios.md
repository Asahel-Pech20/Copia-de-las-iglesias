# B3 · Tareas 03 — Anuncios y cartelera pública

### B3-12 · Publicar anuncio
- **RF:** RF-07.1, RF-07.3 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B1-11
- `POST /anuncios`: `titulo` (≤ 120), `contenido` (≤ 5 000, texto plano o markdown simple), `prioridad`, `fechaPublicacion` (default ahora; puede programarse a futuro), `fechaExpiracion?`, `eventoId?`. `autorId` = usuario actual.
- **Criterios de aceptación**
  - [ ] `fechaExpiracion <= fechaPublicacion` → 400.
  - [ ] `eventoId` inexistente o cancelado → 422.

### B3-13 · Listar, editar y eliminar anuncios
- **RF:** RF-07.2 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B3-12
- `GET /anuncios?vigentes&prioridad` (vigente = publicado y no expirado; los IMPORTANTE primero), `GET /:id`, `PATCH /:id`, `DELETE /:id` (borrado físico permitido).
- **Criterios de aceptación**
  - [ ] Lectura para todos los roles; escritura solo ADMIN, PASTOR, SECRETARIO.
  - [ ] Anuncios programados a futuro no aparecen con `vigentes=true`.

### B3-14 · Servicio de anuncios vigentes
- **RF:** RF-07.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B3-13
- Exportar `anunciosService.vigentes({ soloImportantes, limit })` para el dashboard.
- **Criterios de aceptación**
  - [ ] Prueba unitaria con anuncios vigentes, expirados y programados.

### B3-15 · Cartelera pública
- **RF:** RF-07.4 · **Fase:** 3 · **Tamaño:** S · **Depende de:** B3-06, B3-14, B1-17
- `GET /public/cartelera` sin autenticación → `{ iglesia (nombre, logo, contacto), horarios, anuncios (vigentes, máx. 10), eventosProximos (máx. 10, solo campos públicos) }`. Cache en memoria 60 s; rate limit 60/min/IP.
- **Criterios de aceptación**
  - [ ] No expone datos de miembros, usuarios ni responsables.
  - [ ] Excluido explícitamente de la prueba de "rutas protegidas" de B1-18.
