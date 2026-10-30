# F1 · Tareas 03 — Configuración de la iglesia

### F1-14 · Datos institucionales
- **RF:** RF-10.1, RF-10.3, RF-10.5 · **Fase:** 2 · **Tamaño:** M · **Depende de:** F1-07, B1-15
- `/configuracion` con pestañas *General*, *Logotipo*, *Horarios*. *General*: nombre, dirección, ciudad, teléfono, correo, sitio web, moneda, zona horaria. Solo ADMIN edita; otros roles ven en modo lectura. Hook `useConfiguracion()` global (nombre, logo, moneda) usado por layout y `formatearMoneda`.
- **Criterios de aceptación**
  - [ ] Cambiar el nombre actualiza el layout sin recargar.

### F1-15 · Logotipo
- **RF:** RF-10.2 · **Fase:** 2 · **Tamaño:** S · **Depende de:** F1-14, B1-16
- Zona de arrastrar/soltar con vista previa, validación de tipo y tamaño (≤ 2 MB) antes de subir, barra de progreso.
- **Criterios de aceptación**
  - [ ] Archivo inválido muestra error sin llamar al backend.
  - [ ] Logo nuevo visible en layout y login.

### F1-16 · Horarios de reuniones
- **RF:** RF-10.4 · **Fase:** 3 · **Tamaño:** S · **Depende de:** F1-14, B1-17
- Lista agrupada por día de la semana; agregar/editar en modal (nombre, día, hora inicio/fin, lugar, activo); eliminar con confirmación.
- **Criterios de aceptación**
  - [ ] `horaFin <= horaInicio` bloqueado en el formulario.
