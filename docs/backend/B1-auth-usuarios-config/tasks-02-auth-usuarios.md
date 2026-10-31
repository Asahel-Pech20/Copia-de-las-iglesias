# B1 · Tareas 02 — Autenticación, permisos y usuarios

### B1-08 · Matriz de permisos
- **RF:** RF-01.5, RF-01.6 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B1-05
- `config/permisos.ts`: tipo `Permiso` (`'miembros:leer' | ...`) y mapa `Rol → Permiso[]` según `specs.md §3`. Función `tienePermiso(rol, permiso)`.
- **Criterios de aceptación**
  - [x] Prueba unitaria que recorre la matriz completa de `specs.md §3`.
  - [x] Lista de permisos exportada para que F1 la copie.

### B1-09 · Login y middleware `autenticar`
- **RF:** RF-01.2, RF-01.3 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B1-08
- `POST /auth/login`: valida credenciales (bcrypt), rechaza usuarios inactivos, emite access token (payload `sub`, `rol`) y refresh token en cookie; actualiza `ultimoAcceso`. Rate limit 5/min/IP. Middleware `autenticar` valida el Bearer y carga `req.usuario`.
- **Criterios de aceptación**
  - [ ] Credenciales inválidas → 401 con mensaje genérico ("Correo o contraseña incorrectos").
  - [ ] Usuario inactivo → 401 mismo mensaje.
  - [ ] Token expirado → 401 `TOKEN_EXPIRED`.
  - [ ] 6.º intento en un minuto → 429.

### B1-10 · Refresh, logout y `/auth/me`
- **RF:** RF-01.2 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B1-09
- `POST /auth/refresh` rota el refresh token (revoca el anterior; si se reutiliza uno revocado, revoca todos los del usuario). `POST /auth/logout` revoca y limpia cookie. `GET /auth/me` → usuario + `permisos[]`.
- **Criterios de aceptación**
  - [ ] Refresh reutilizado → 401 y todas las sesiones del usuario cerradas.
  - [ ] `/auth/me` nunca incluye `passwordHash`.

### B1-11 · Middleware `autorizar`
- **RF:** RF-01.6 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B1-08, B1-09
- `autorizar(...permisos)` → 403 `FORBIDDEN` si el rol no tiene alguno. Helper `esCoordinadorDe(usuarioId, ministerioId)` para reglas de "propio" (lo usan B2/B3).
- **Criterios de aceptación**
  - [ ] Prueba con un rol con y sin permiso.

### B1-12 · Recuperación de contraseña
- **RF:** RF-01.4 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B1-09
- `POST /auth/forgot-password` genera token (32 bytes, hasheado, 1 h) y envía correo con enlace `${FRONTEND_URL}/restablecer?token=...`. `POST /auth/reset-password` valida, cambia contraseña, marca token usado y revoca refresh tokens. `PATCH /auth/me/password` exige contraseña actual.
- **Criterios de aceptación**
  - [ ] `forgot-password` responde 204 aunque el correo no exista.
  - [ ] Token usado o expirado → 400.
  - [ ] Correo visible en Mailpit.

### B1-13 · CRUD de usuarios
- **RF:** RF-01.1, RF-01.5 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B1-11
- `GET /usuarios` (filtros `q`, `rol`, `activo`, paginado), `POST`, `GET /:id`, `PATCH /:id` (nombre, email, rol), `PATCH /:id/estado`. Solo ADMIN. Además `GET /usuarios/opciones?rol=` (ADMIN y PASTOR) que devuelve solo `{ id, nombre, rol }` de usuarios activos, para que B2/F2 asignen coordinadores.
- **Criterios de aceptación**
  - [ ] Email duplicado → 409.
  - [ ] No se puede desactivar ni quitar rol ADMIN al último administrador activo → 422.
  - [ ] Un ADMIN no puede desactivarse a sí mismo → 422.
  - [ ] Desactivar revoca sus refresh tokens.

### B1-14 · Contraseña inicial de usuarios nuevos
- **RF:** RF-01.1, RF-01.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B1-12, B1-13
- Al crear un usuario sin contraseña, enviar correo de "Configura tu contraseña" reutilizando el flujo de reset (token de 48 h). Endpoint `POST /usuarios/:id/reenviar-invitacion`.
- **Criterios de aceptación**
  - [ ] El usuario puede fijar su contraseña desde el enlace y luego iniciar sesión.
