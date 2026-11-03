# Auditoría 1 · F4 — Donaciones, dashboard, reportes (Oscar)

> Lee solo este archivo y los que cita. Contexto general: [../../README.md](../../README.md).
> Estado: implementado **sin commitear** en `feat/B4-F4-donaciones-dashboard-reportes`.

## Resultado

- Pasan las 184 pruebas del frontend, lint, typecheck y Prettier.
- Los tipos espejan el backend (`types/donaciones.ts` contra `donaciones.service.ts`).
- La descarga con `responseType: 'blob'` lee el error JSON dentro del Blob y reintenta tras `TOKEN_EXPIRED`.
- Los filtros viajan en la URL con `useFiltrosURL`.

**Revisión visual en el navegador integrado (mocks):**
- `/`, `/donaciones` y `/reportes?tipo=ingresos` a 360 px: sin scroll horizontal.
- Modo oscuro: los colores de tokens se ven bien en tarjetas, gráficas y avisos.
- Por lo tanto, ya se pueden marcar los 2 criterios pendientes de `tasks-02-dashboard.md` (modo oscuro y 360 px).

## Observaciones

| ID | Sev. | Dónde | Observación | Acción sugerida | Estado |
|---|---|---|---|---|---|
| A1-F4-01 | Media | `features/dashboard/pages/DashboardPage.tsx:52-53` | Con 1024 px de ancho (área principal de 769 px por la barra de 240 px), `lg:grid-cols-3` deja la columna lateral en **224 px**: «Ver todos» se parte y los avisos quedan apretados. Verificado en el navegador. | Cambiar a `xl:grid-cols-3` / `xl:col-span-2`, para que debajo de 1280 px la columna lateral pase abajo. | [x] |
| A1-F4-02 | Baja | `features/donaciones/components/AportacionesTab.tsx:86` | `filtrosReporte` solo manda `desde` y `hasta`. Se ignoran concepto, método, donante y «solo anónimas», así que el archivo exportado no coincide con la tabla. Depende de `A1-B4-03`. | Si B4 no amplía el contrato, poner un texto de ayuda junto a «Exportar»: «Exporta todas las aportaciones del rango». | [x] |
| A1-F4-03 | Baja | `DashboardPage.tsx:55` (`{d && <Graficas d={d} />}`) | Mientras carga no hay skeleton para las gráficas: aparecen de golpe y desplazan el contenido. | Mostrar 2–4 `TarjetaGrafica` con un skeleton mientras `d === undefined`. | [x] |
| A1-F4-04 | Baja | `features/donaciones/pages/DonacionesPage.tsx` (pestañas) | A 360 px la tercera pestaña queda cortada («Resumen mensu…»). | Usar etiquetas cortas en móvil («Mensual») o resolverlo con `A1-F1-03`. | [x] |
| A1-F4-05 | Baja | `mocks/handlers/dashboard.ts` | «Altas de miembros por mes» sale toda en 0 con los mocks: la gráfica se ve vacía en la demo. | Generar altas en el mock a partir de `fechaIngreso` de los miembros simulados. | [x] |
| A1-F4-06 | Info | `DonacionDetalleDialog.tsx:92-100` | «Anulada por» usa `actualizadoPor` porque el backend no tiene un campo propio. | Cuando se haga `A1-B4-01`, usar `anuladaPor` y mostrar «Editada por» por separado. | [ ] |

## Antes del PR

1. [x] Marcar en `tasks-02-dashboard.md` los criterios de modo oscuro y 360 px (ya verificados).
2. Commit: `feat(donaciones,dashboard,reportes): F4 — pantallas de donaciones, dashboard y reportes`.
3. Pedir a F1 que revise `lib/formato.ts` y `App.test.tsx` (ver `A1-F1-04`).
4. Avisar a F2 de `AportacionesDelMiembro` y `BotonExportar` (ver `A1-F2-01` y `A1-F2-02`).
