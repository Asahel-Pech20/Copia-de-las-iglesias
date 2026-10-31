---
description: Implementa una tarea de docs/ siguiendo el contrato y las reglas del proyecto (ej. /tarea B1-02)
argument-hint: <ID de tarea, ej. B1-02>
---

Implementa la tarea **$ARGUMENTS** de AppIglesia.

1. **Localiza la tarea**: busca `### $ARGUMENTS ·` en `docs/**/tasks-*.md`. Lee su descripción, dependencias y criterios de aceptación, y el `plan.md` de su subsección.
2. **Verifica dependencias**: si alguna tarea de la que depende no está hecha en el código, detente y dilo.
3. **Revisa el contrato**: lee las secciones de `specs.md` que toca la tarea (modelo §6, API §7) y las reglas de `AGENTS.md` aplicables (backend §3 / frontend §4).
4. **Rama**: confirma que estás en `feat/$ARGUMENTS-<descripcion-corta>`; si no, pide permiso para crearla.
5. **Implementa** solo lo que pide la tarea, dentro de su módulo. No inventes endpoints, campos ni enums. No agregues dependencias fuera del stack de `specs.md §4` sin avisar.
6. **Prueba**: escribe las pruebas que exige `AGENTS.md` y córrelas. Corre `pnpm lint` y `pnpm typecheck`.
7. **Cierra**: marca los checkboxes de los criterios cumplidos en el `tasks-*.md`. Actualiza `CLAUDE.md` (Estado actual / Decisiones) si cambió algo relevante.
8. **Reporta**: archivos cambiados, comandos y pruebas ejecutados con su resultado, criterios cubiertos y los que no se pudieron verificar (y por qué). Propón el mensaje de commit (Conventional Commits en español) sin hacer commit ni push.
