# F1 · Tareas 02 — Autenticación, permisos y usuarios

### F1-08 · Pantalla de inicio de sesión
- **RF:** RF-01.2, RF-01.3 · **Fase:** 1 · **Tamaño:** M · **Depende de:** F1-07, B1-09
- `/login`: logo y nombre de la iglesia (`GET /configuracion`), correo, contraseña (mostrar/ocultar), enlace "¿Olvidaste tu contraseña?". Errores del servidor en un `Alert`; 429 muestra "Demasiados intentos, espera un minuto".
- **Criterios de aceptación**
  - [ ] Tras login redirige a la ruta original (`?redirect=`) o `/`.
  - [ ] Usuario ya autenticado en `/login` → redirige a `/`.

### F1-09 · Contexto de sesión y cierre de sesión
- **RF:** RF-01.2 · **Fase:** 1 · **Tamaño:** M · **Depende de:** F1-08
- `AuthProvider`: access token en memoria (no en localStorage), al cargar intenta `/auth/refresh` + `/auth/me`; expone `usuario`, `permisos`, `iniciarSesion`, `cerrarSesion`. Pantalla de carga mientras se resuelve la sesión.
- **Criterios de aceptación**
  - [ ] Recargar la página mantiene la sesión (vía cookie de refresh).
  - [ ] Cerrar sesión limpia caché de TanStack Query.

### F1-10 · Permisos en UI y rutas protegidas
- **RF:** RF-01.5, RF-01.6 · **Fase:** 1 · **Tamaño:** S · **Depende de:** F1-09, B1-08
- `lib/permisos.ts` (copia de la matriz de B1), `usePermiso()`, `<Puede permiso>`, `<RutaProtegida permiso>`; página 403 "No tienes acceso" y 404.
- **Criterios de aceptación**
  - [ ] Prueba: TESORERO no ve "Usuarios" en el menú y `/usuarios` muestra 403.

### F1-11 · Recuperar y restablecer contraseña
- **RF:** RF-01.4 · **Fase:** 1 · **Tamaño:** S · **Depende de:** F1-08, B1-12
- `/recuperar` (correo → mensaje neutro "Si el correo existe, te enviamos un enlace"), `/restablecer?token=` (nueva contraseña + confirmación, reglas visibles).
- **Criterios de aceptación**
  - [ ] Token inválido/expirado muestra mensaje y enlace para solicitar otro.

### F1-12 · Gestión de usuarios
- **RF:** RF-01.1, RF-01.5 · **Fase:** 2 · **Tamaño:** M · **Depende de:** F1-06, F1-07, B1-13
- `/usuarios` (solo ADMIN): tabla con búsqueda, filtro por rol y estado; modal crear/editar (nombre, correo, rol); acción activar/desactivar con `ConfirmDialog`; "Reenviar invitación".
- **Criterios de aceptación**
  - [ ] Errores 409 y 422 (último admin) se muestran en el campo / diálogo correspondiente.
  - [ ] El ADMIN no ve la acción "Desactivar" sobre sí mismo.

### F1-13 · Mi cuenta
- **RF:** RF-01.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** F1-09, B1-12
- `/mi-cuenta`: datos del usuario y cambio de contraseña (`PATCH /auth/me/password`).
- **Criterios de aceptación**
  - [ ] Contraseña actual incorrecta → error en el campo.
