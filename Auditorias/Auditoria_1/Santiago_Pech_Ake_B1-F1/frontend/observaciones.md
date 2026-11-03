# Auditoría 1 · F1 — Base UI, layout, auth, usuarios, configuración (Santiago)

> Lee solo este archivo y los que cita. Contexto general: [../../README.md](../../README.md).

## Resultado

- La matriz `lib/permisos.ts` es idéntica a la del backend.
- No hay `any`, `@ts-ignore` ni `console.log`.
- Las páginas no llaman a Axios: solo importan `normalizarError` y `errorDeCampo`.
- La búsqueda usa debounce de 300 ms y tiene prueba.
- El modo oscuro con tokens se ve bien.

## Observaciones

| ID | Sev. | Dónde | Observación | Acción sugerida | Estado |
|---|---|---|---|---|---|
| A1-F1-01 | Baja | `components/ui/dialog.tsx:17`, `components/ui/sheet.tsx:19` | El overlay usa `bg-black`, un color suelto. `AGENTS.md` §4 pide usar solo tokens. | Agregar un token `--overlay` (o `bg-texto/60`) y usarlo en los dos componentes. | [ ] |
| A1-F1-02 | Baja | `components/comunes/Paginacion` | A 360 px el texto «Página 1 de 1» se parte en dos líneas entre los botones (visto en `/donaciones`). | Usar `whitespace-nowrap` o un texto corto en móvil («1 / 1»). | [ ] |
| A1-F1-03 | Baja | `components/ui` (Tabs) | A 360 px, con 3 pestañas, la última queda cortada («Resumen mensu…»). Se puede desplazar, pero nada lo indica. | Dejar que la lista se ajuste en varias líneas o agregar un degradado o indicador de desplazamiento. | [ ] |
| A1-F1-04 | Info | `lib/formato.ts`, `App.test.tsx` | F4 (sin commitear) agregó a tu archivo `ETIQUETAS_CONCEPTO`, `ETIQUETAS_METODO`, la agrupación, `formatearMes` y `etiquetaClave`. Además, cambió 2 regex de `App.test.tsx` porque el saludo ahora es «Buenos días / Buenas tardes / Buenas noches, {nombre}». | Revisar esos cambios en el PR de F4. | [ ] |

## Pendientes de tus tasks

Ninguno sin marcar en F1.
