# AppIglesia

Aplicación web para la administración interna de una iglesia: usuarios con roles, miembros, asistencia, eventos, ministerios, donaciones, anuncios, dashboard, reportes y configuración institucional.

- Qué se construye y con qué → [specs.md](specs.md)
- Reglas obligatorias → [AGENTS.md](AGENTS.md)
- Memoria del proyecto → [CLAUDE.md](CLAUDE.md)
- Tareas por integrante → [docs/README.md](docs/README.md)
- Arnés de IA (Claude Code) → [docs/arnes.md](docs/arnes.md)

## Requisitos

| Herramienta | Versión | Instalación |
|---|---|---|
| Node.js | 22 o superior | <https://nodejs.org> |
| pnpm | la fijada en `package.json` (`packageManager`) | `npm install -g pnpm` o `corepack enable` (como administrador) |
| Docker Desktop | con `docker compose` | <https://www.docker.com/products/docker-desktop> |

## Puesta en marcha

```bash
docker compose up -d     # postgres (5432), postgres-test (5433), mailpit (1025 / 8025)
pnpm install             # instala backend y frontend (workspaces)
pnpm dev                 # backend + frontend en paralelo
```

Mailpit (correos de prueba): <http://localhost:8025>

## Scripts de la raíz

| Script | Qué hace |
|---|---|
| `pnpm dev` | Corre `dev` de cada paquete en paralelo |
| `pnpm test` | Corre las pruebas (Vitest) de cada paquete |
| `pnpm lint` | ESLint sobre todo el repositorio |
| `pnpm typecheck` | `tsc --noEmit` en cada paquete |
| `pnpm format` / `pnpm format:check` | Prettier (escribe / solo revisa) |

## Estructura

```
.
├── .claude/              # arnés de Claude Code (permisos, hooks, comando /tarea)
├── backend/              # API Express + Prisma (se construye desde B1-02)
├── frontend/             # React + Vite (se construye desde F1-01)
├── docs/                 # planes y tareas por subsección
├── docker-compose.yml    # servicios de desarrollo
├── eslint.config.js      # ESLint compartido
├── .prettierrc.json      # Prettier compartido
├── tsconfig.base.json    # opciones TypeScript strict compartidas
└── pnpm-workspace.yaml
```

## Configuración compartida

- **TypeScript**: `tsconfig.base.json` en modo `strict` (+ `noUncheckedIndexedAccess`). Cada paquete lo extiende.
- **ESLint** (flat config): reglas recomendadas de JS y TypeScript, prohíbe `any`, avisa de `console.log`. Desactiva lo que choca con Prettier.
- **Prettier**: comillas simples, punto y coma, 100 columnas. Los `.md` no se formatean para respetar las tablas de la documentación.
- **EditorConfig** y `.gitattributes`: UTF-8, saltos de línea LF, 2 espacios.

> TypeScript está fijado en `~6.0` porque `typescript-eslint` todavía no soporta TypeScript 7.
