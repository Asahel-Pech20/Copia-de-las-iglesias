# Auditoría 1 · B4 — Donaciones, dashboard, reportes (Oscar)

> Lee solo este archivo y los que cita. Contexto general: [../../README.md](../../README.md).
> Commit auditado: `1e7220b` (sin push).

## Resultado

Las reglas críticas se cumplen y tienen prueba:
- **Anonimato:** `anonima ⇔ miembroId = null`.
- **Anulación:** se anula con motivo y nunca se borra.
- **Montos:** son string, y las sumas se hacen en `NUMERIC`.
- **Datos financieros:** `ingresos` se omite sin `donaciones:leer`, probado con los 5 roles.
- **Reportes:** se filtran por permiso, incluido `-propio` para el coordinador.
- **Exportación:** el PDF tiene un límite de 5 000 filas (422).

## Observaciones

| ID | Sev. | Dónde | Observación | Acción sugerida | Estado |
|---|---|---|---|---|---|
| A1-B4-01 | Media | `schema.prisma` (modelo `Donacion`), `donaciones.service.ts` (`editar`, `anular`) | RNF-04 pide saber quién registró, editó y anuló. Solo existe `actualizadoPorId`: si A edita y luego B anula, se pierde quién editó. El frontend muestra «Anulada por» con `actualizadoPor`. | PR de schema revisado por B1: agregar `anuladaPorId String?` (relación a `Usuario`) con migración nueva, llenarlo en `anular()`, exponerlo como `anuladaPor { id, nombre }` y actualizar `specs.md` §6 y `openapi.yaml`. | [ ] |
| A1-B4-02 | Media | `reportes.service.ts:235` (`eventosConAsistencia`), `:345` (`asistenciaPorIntegrante`); `dashboard.service.ts:115` (`huellaDatos`) | SQL directo sobre tablas de B3 (`eventos`, `asistencias`) y, en la huella, de todos los módulos. `AGENTS.md` §3 pide llamar al service del dueño. | Mover las dos consultas de reportes a `asistenciaService` (por ejemplo `eventosConTotales(desde, hasta, ministerioIds?)` y `totalesPorIntegrante(ministerioId, desde, hasta)`), con revisión de B3. Para la huella, documentar la excepción en `AGENTS.md`, porque es de solo lectura y no tiene lógica de negocio. | [ ] |
| A1-B4-03 | Baja | `reportes.schemas.ts` (`esquemaReporteIngresos`) | `/reportes/ingresos` solo acepta `desde`, `hasta` y `agrupar`. Si en `/donaciones` se exporta con filtro de concepto, método o donante, el archivo **no** coincide con la pantalla. F4-11 dice «con los filtros actuales». | Opción A: agregar `concepto` y `metodo` opcionales al reporte (cambio de contrato en `specs.md` §7.2, en el mismo PR). Opción B: dejarlo así y que F4 lo aclare en la UI (ver `A1-F4-02`). | [ ] |
| A1-B4-04 | Baja | Reporte de ingresos agrupado por mes (`reportes.service.ts`) | La columna «Mes» sale como `2026-01`, y así aparece en la vista previa, el PDF y el Excel. | Formatear la etiqueta («ene 2026») al armar el `Reporte`, o agregar `tipo: 'mes'` a `Columna` en `lib/exportadores/reporte.ts`. | [ ] |
| A1-B4-05 | Baja | `dashboard.service.ts:115`, B4-07/B4-08 | `huellaDatos()` hace 7 subconsultas `count/max` en cada petición, incluso con la cache válida. No se ha medido el tiempo (< 500 ms) con el seed completo, ni hay una prueba de consistencia contra los endpoints de cada módulo. | Medir con el seed (`db:seed` + 20 peticiones) y anotar el resultado en el task. Si la huella pesa, reducirla a `max(updatedAt)` por tabla. | [ ] |

## Pendientes de tus tasks

Ninguno sin marcar, pero B4-07 y B4-08 tienen notas de verificación parcial: ver `A1-B4-05`.
