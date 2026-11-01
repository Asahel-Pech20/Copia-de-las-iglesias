# Arnés de IA — Claude Code

> Responsable: Santiago Asahel Pech Ake (B1). Creado junto con la tarea B1-01.

## ¿Qué es el arnés?

Un modelo de IA por sí solo solo genera texto. El **arnés** (*harness*) es todo lo que lo rodea para que trabaje de forma controlada dentro del proyecto. En AppIglesia el arnés es **Claude Code** configurado con los archivos de este repositorio. Cumple cuatro funciones:

| Función | Qué resuelve | Dónde vive |
|---|---|---|
| **1. Contexto** | Que el agente sepa qué es el proyecto, sus reglas y qué tarea hacer | `CLAUDE.md`, `AGENTS.md`, `specs.md`, `docs/**/tasks-*.md` |
| **2. Herramientas** | Que pueda leer, editar y ejecutar comandos | Claude Code (integradas) |
| **3. Límites** | Qué puede hacer solo, qué debe preguntar y qué tiene prohibido | `.claude/settings.json` → `permissions` |
| **4. Verificación** | Que lo que produce cumpla las reglas antes de darlo por terminado | `.claude/settings.json` → `hooks` + `.claude/hooks/*.mjs` |

La terminal (Warp, PowerShell, la app de escritorio, etc.) no forma parte del arnés. Es solo el lugar donde corre.

## 1. Contexto

- **`CLAUDE.md`**: Claude Code lo carga automáticamente al abrir el proyecto. Sus líneas `@AGENTS.md` y `@specs.md` importan también las reglas y la especificación, así que el agente arranca conociendo el contrato de la API, el modelo de datos y las convenciones.
- **`AGENTS.md` §7**: restricciones específicas para agentes. Por ejemplo: no inventar endpoints, no salir del módulo asignado, no hacer push y no desactivar pruebas.
- **`docs/**/tasks-*.md`**: cada tarea tiene ID, dependencias y criterios de aceptación verificables.

## 2. Comando `/tarea` (flujo de trabajo)

`.claude/commands/tarea.md` define el comando `/tarea <ID>`, por ejemplo `/tarea B1-02`. Obliga al agente a seguir siempre el mismo flujo:

1. Localizar la tarea y sus criterios de aceptación.
2. Comprobar que sus dependencias estén hechas (si no, se detiene).
3. Leer las secciones de `specs.md` y `AGENTS.md` que aplican.
4. Confirmar que trabaja en la rama `feat/<ID>-...`.
5. Implementar solo lo pedido.
6. Escribir y correr pruebas, lint y typecheck.
7. Marcar los checkboxes cumplidos y actualizar `CLAUDE.md`.
8. Reportar archivos, comandos, criterios cubiertos y no cubiertos, y proponer el commit **sin** hacerlo.

## 3. Límites (`permissions`)

| Nivel | Ejemplos | Efecto |
|---|---|---|
| `allow` | `pnpm lint`, `pnpm test`, `pnpm typecheck`, `git status`, `git diff` | Los ejecuta sin preguntar |
| `ask` | `git commit`, `docker compose up`, `pnpm add`, `prisma migrate` | Pide confirmación a la persona |
| `deny` | `git push`, `git merge`, `prisma migrate reset`, `DROP TABLE`, `rm -rf`, leer o editar `.env` | Bloqueado siempre |

Cada regla sale de `AGENTS.md`. Por ejemplo, la regla 6 ("Sin secretos en git") lleva a bloquear los `.env`. La §7 ("No ejecutar `prisma migrate reset` ... sin confirmación humana") lleva a bloquear el reset, y "No agregar dependencias sin acuerdo" lleva a que `pnpm add` pida confirmación.

> Comprobado durante B1-01: al intentar `rm -rf node_modules`, el propio arnés bloqueó el comando.

## 4. Verificación (`hooks`)

| Hook | Cuándo corre | Qué hace |
|---|---|---|
| `PostToolUse` → `formatear.mjs` | Después de cada edición de archivo | Formatea el archivo con Prettier. El código siempre queda con el estilo del equipo |
| `Stop` → `verificar.mjs` | Cuando el agente va a terminar su respuesta | Si hay cambios en código, corre `pnpm lint` y `pnpm typecheck`. Si fallan, sale con código 2: el agente recibe los errores y **tiene que corregirlos** antes de terminar. Solo bloquea una vez seguida para evitar ciclos |

Así se cumple automáticamente parte de la Definición de Terminado (`AGENTS.md` §6): "Lint y typecheck sin errores".

Prueba realizada en B1-01: se creó un archivo con `const noUsada: any = 1;`. El hook `Stop` respondió con código 2 y los dos errores de ESLint (`no-unused-vars`, `no-explicit-any`). Con el archivo corregido respondió con código 0.

## Cómo demostrarlo

1. Abrir Claude Code en la carpeta del repositorio.
2. Mostrar los archivos: `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `.claude/hooks/`, `.claude/commands/tarea.md`.
3. Pedir algo prohibido (ej. "haz git push"). El arnés lo bloquea.
4. Ejecutar `/tarea <ID>` sobre una tarea pendiente y ver cómo sigue el flujo, formatea, verifica y reporta.
5. Revisar el historial de git: una rama y un commit por tarea, con los checkboxes marcados en `docs/`.

## Archivos personales

`.claude/settings.local.json` (ignorado por git) sirve para preferencias propias de cada integrante sin afectar al equipo.
