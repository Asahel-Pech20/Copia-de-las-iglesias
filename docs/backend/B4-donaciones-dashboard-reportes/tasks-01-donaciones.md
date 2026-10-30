# B4 · Tareas 01 — Donaciones y aportaciones

### B4-01 · Registrar aportación
- **RF:** RF-06.1, RF-06.2, RF-06.6 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B1-11
- `POST /donaciones`: `fecha` (no futura), `monto` (string decimal > 0, 2 decimales máx.), `concepto`, `conceptoDetalle?` (obligatorio si `OTRO`), `metodo`, `miembroId?`, `anonima`, `referencia?`, `notas?`. `registradoPorId` = usuario actual. Permiso `donaciones:crear` (ADMIN, TESORERO).
- **Criterios de aceptación**
  - [ ] `anonima: true` con `miembroId` → 400; sin `miembroId` ⇒ se guarda `anonima = true`.
  - [ ] `monto` como `number` en JSON también se acepta pero se responde como string `"1500.00"`.
  - [ ] PASTOR → 403 al crear.

### B4-02 · Consultar aportaciones por periodo
- **RF:** RF-06.3, RF-06.5 · **Fase:** 1 · **Tamaño:** M · **Depende de:** B4-01
- `GET /donaciones?desde&hasta&concepto&metodo&miembroId&anonima&incluirAnuladas` paginado, orden `fecha desc`. `meta.totalMonto` con la suma del filtro (sin anuladas). `GET /donaciones/:id` incluye quién registró/editó/anuló.
- **Criterios de aceptación**
  - [ ] SECRETARIO y COORDINADOR → 403.
  - [ ] Por defecto excluye anuladas.

### B4-03 · Editar aportación
- **RF:** RF-06.2 · **Fase:** 1 · **Tamaño:** S · **Depende de:** B4-02
- `PATCH /donaciones/:id` guarda `actualizadoPorId`. No se edita una anulada.
- **Criterios de aceptación**
  - [ ] Editar anulada → 422.
  - [ ] Mismas reglas de anonimato que B4-01.

### B4-04 · Anular aportación
- **RF:** RF-06.5 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B4-03
- `PATCH /donaciones/:id/anular { motivo }` → `anulada`, `motivoAnulacion`, `anuladaEn`, `actualizadoPorId`. No existe `DELETE`.
- **Criterios de aceptación**
  - [ ] Anulada no suma en ningún resumen ni dashboard.

### B4-05 · Resumen de ingresos por periodo
- **RF:** RF-06.3 · **Fase:** 2 · **Tamaño:** M · **Depende de:** B4-04
- `GET /donaciones/resumen?desde&hasta&agrupar=dia|semana|mes|concepto|metodo` → `{ total, cantidad, grupos: [{ clave, total, cantidad }] }`. Agrupaciones temporales con la zona horaria configurada y series continuas (ceros incluidos). Exportar `donacionesService.resumen()`.
- **Criterios de aceptación**
  - [ ] Totales en string decimal exactos (prueba con 0.10 + 0.20).
  - [ ] Rango máximo 2 años.

### B4-06 · Resumen mensual
- **RF:** RF-06.4 · **Fase:** 2 · **Tamaño:** S · **Depende de:** B4-05
- `GET /donaciones/resumen-mensual?anio&mes` → total del mes, comparación con mes anterior (`variacionPorcentual`), desglose por concepto y por método, número de aportaciones anónimas vs. identificadas.
- **Criterios de aceptación**
  - [ ] Mes sin datos → totales `"0.00"` y variación `null`.
