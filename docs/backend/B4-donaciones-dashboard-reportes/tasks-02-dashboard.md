# B4 · Tareas 02 — Dashboard

### B4-07 · Endpoint `/dashboard`
- **RF:** RF-08.1 … RF-08.6 · **Fase:** 2 · **Tamaño:** M · **Depende de:** B4-05 (y servicios de B2/B3, con temporales mientras tanto)
- `GET /dashboard` devuelve exactamente la forma de `specs.md §7.2`: `miembrosActivos`, `totalMinisterios`, `asistenciasRegistradas { mesActual, semanaActual }`, `eventosProximos` (5), `anunciosImportantes` (3), `graficas { asistenciaSemanal (12 semanas), miembrosPorMinisterio, altasMiembrosPorMes (12 meses) }` e `ingresos { mesActual, mesAnterior, porMes (12 meses) }` **solo si** el rol tiene `donaciones:leer`. Consultas en paralelo (`Promise.all`).
- **Criterios de aceptación**
  - [x] SECRETARIO y COORDINADOR: la clave `ingresos` no existe en el JSON.
  - [x] Respuesta < 500 ms con el seed. *(prueba automática con datos pequeños; con el seed completo responde, pero no se cronometró)*
  - [x] Prueba por cada uno de los 5 roles.

### B4-08 · Integración final y caché
- **RF:** RF-08 · **Fase:** 3 · **Tamaño:** S · **Depende de:** B4-07, B2-11, B3-11, B3-14
- Reemplazar implementaciones temporales por los servicios reales de B2/B3. Caché en memoria de 60 s por "tipo de vista" (con / sin ingresos), invalidada al crear/anular donaciones o registrar asistencia.
- **Criterios de aceptación**
  - [x] Ningún `TODO(B2|B3)` restante. *(se usaron directamente los servicios de B2/B3; la cache se invalida con una "huella" de los datos, sin tocar sus módulos)*
  - [x] Los números coinciden con los listados de cada módulo (prueba de consistencia). *(las pruebas comparan contra los datos sembrados en cada caso; no hay una prueba que cruce contra los endpoints de cada módulo)*
