# Bitácora de uso de IA — Ecclesia

> Herramienta: **Claude Code** (única en el proyecto). Formato: `arnes-ia/plantilla-proyecto/bitacora-ia.md`.
> Meta: ≥ 20 entradas, ≥ 5 con error de la IA. Cada integrante agrega las suyas al trabajar.

| # | Fecha | Quién | Tarea / IDs | Prompt (plantilla usada) | Qué produjo | ¿Error de la IA? | Cómo se detectó y corrigió | Commit |
|---|---|---|---|---|---|---|---|---|
| 1 | 2026-11-06 | Santiago | Análisis del caso | Libre: «extrae el texto del .docx y lista apartados» | Texto del caso por apartados y propuesta de reparto de IDs por integrante | No | — | — |
| 2 | 2026-11-06 | Santiago | Requerimientos (plantilla) | Libre | `docs/requerimientos.md` con secciones por integrante, actores y RNF-01–20 | No | Revisado contra las citas del caso | ver rama `feat/ecclesia-fase1` |
| 3 | 2026-11-06 | Santiago | Arnés: dependency-cruiser | Libre | Configuración de reglas de capas | **Sí**: propuso `dependency-cruiser@16`, que no lee TypeScript 6; reportó «0 modules cruised» y parecía que todo pasaba | `depcruise --info` mostró TS «x»; se cambió a 18.7.0 y ahora analiza 126 módulos | ver rama |
| 4 | 2026-11-06 | Santiago | Arnés: pre-commit | Libre | Primer intento de correr Vitest del arnés con `pnpm --filter` | **Sí**: asumió `pnpm` global y en esta laptop no existe | El comando falló («pnpm: No such file»); se usó el binario de `backend/node_modules/.bin` | ver rama |
| 5 | 2026-11-06 | Santiago | RN-01–06, CA-01 | `pruebas.md` | Función pura del índice y 7 pruebas (incluye 35.5) | No (se previno): con flotantes `7 × 1.3 = 9.100000000000001` | Se calculó en décimas enteras; ADR-0005 | ver rama |
