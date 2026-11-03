# Auditoría 1 · B1 — Infraestructura, auth, usuarios, configuración (Santiago)

> Lee solo este archivo y los que cita. Contexto general: [../../README.md](../../README.md).

## Resultado

Todo lo exigido por `AGENTS.md` §3 se cumple:
- **Cookie de refresh:** `httpOnly`, `SameSite=Strict`, `Path=/api/v1/auth` y `Secure` en producción.
- **Límites por minuto:** login 5, `forgot-password` 5 y `reset-password` 10.
- **Seguridad general:** helmet, CORS limitado a `FRONTEND_URL` y logs con `redact`.
- **Contraseñas:** `passwordHash` nunca se serializa.
- **Permisos:** la matriz coincide con el frontend y `rutasProtegidas.test.ts` cubre todas las rutas.

## Observaciones

| ID | Sev. | Dónde | Observación | Acción sugerida | Estado |
|---|---|---|---|---|---|
| A1-B1-01 | Baja | Prisma + adaptador `pg` (patrón `prisma.$transaction([...])` de `modules/_plantilla/_plantilla.service.ts:19`, copiado en 8 services) | Al correr las pruebas aparece `DeprecationWarning: Calling client.query() when the client is already executing a query`. En `pg@9` será un error. La causa probable es la transacción en lote, que con el adaptador manda las consultas a la vez por una sola conexión. | Confirmar la causa con `node --trace-deprecation`. Si es el lote, cambiar la plantilla por `Promise.all([findMany, count])` fuera de la transacción, o por una transacción interactiva secuencial. Avisar a B2 y B3, que la copiaron. | [x] Plantilla, `usuarios` y `auth` usan `Promise.all` (lecturas) o transacción interactiva (escrituras). Falta que B2 y B3 cambien sus `$transaction([...])`. |
| A1-B1-02 | Baja | `modules/auth/auth.routes.ts:30` | `POST /auth/logout` exige `autenticar`. Si el access token venció y el refresh falla, el cliente no puede revocar la cookie. El interceptor del frontend lo cubre en el caso normal. | Hacer que logout dependa solo de la cookie, sin `autenticar`. | [x] `POST /auth/logout` solo usa la cookie; prueba nueva y `specs.md` / OpenAPI actualizados. |
| A1-B1-03 | Baja | `.claude/launch.json:6` | El arranque del frontend usa solo `corepack`, que no existe en algunas laptops del equipo (falló en la de Oscar). `verificar.mjs` ya intenta primero `pnpm` y usa `corepack` como respaldo. | Usar `"runtimeExecutable": "pnpm"` o documentar `npm i -g pnpm@12.16.1` en el README. | [x] `launch.json` usa `npm --prefix frontend run dev`: no necesita `pnpm` ni `corepack`. |

## Pendientes de tus tasks

- **B1-02:** falta la «revisión de B2, B3 y B4 del schema». B4 lo revisó y queda una petición: ver `A1-B4-01` en [../../Oscar_Matos_May_B4-F4/backend/observaciones.md](../../Oscar_Matos_May_B4-F4/backend/observaciones.md), que propone agregar `Donacion.anuladaPorId` con una migración nueva.
- **B1-02:** falta verificar `prisma studio`.
- **B1-05 (CI):** falta probar que un PR con error de lint hace fallar el CI.
