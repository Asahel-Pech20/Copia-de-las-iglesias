# CLAUDE.md — Memoria del proyecto AppIglesia

> Lo esencial para trabajar en el proyecto sin releer todo. Detalle técnico → `specs.md`. Reglas → `AGENTS.md`.
> Mantener este archivo **corto y actualizado**: cuando se tome una decisión importante, agregarla a "Decisiones" con fecha.

@AGENTS.md
@specs.md

---

## Qué es
Aplicación web de administración interna de una iglesia (proyecto de la materia *Aplicaciones Web*, 4.º cuatrimestre). Equipo de **4 integrantes**, cada uno dueño de un dominio en backend y frontend.

## Stack (resumen)
- **Backend**: Node 22 + Express 5 + TypeScript + Prisma + PostgreSQL 16 + Zod + JWT. Pruebas: Vitest + Supertest.
- **Frontend**: React 19 + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Query + React Hook Form + FullCalendar + Recharts. Mocks: MSW.
- **Monorepo** pnpm: `backend/`, `frontend/`, `docs/`. Docker: postgres, postgres-test, mailpit.

## Comandos (cuando exista el código)
```bash
docker compose up -d                 # BD + correo
pnpm install
pnpm --filter backend prisma migrate dev
pnpm --filter backend db:seed
pnpm dev                             # backend :3000 + frontend :5173
pnpm test                            # pruebas de ambos
pnpm lint && pnpm typecheck
```
- API: `http://localhost:3000/api/v1` · Swagger: `/api/docs` · Mailpit: `http://localhost:8025`

## Dueños
| Integrante | Backend | Frontend | Dominio |
|---|---|---|---|
| Santiago Asahel Pech Ake | B1 | F1 | Infraestructura, auth, usuarios, permisos, configuración, componentes base UI, `schema.prisma` |
| Nataly Marisol Santos Miam | B2 | F2 | Miembros, ministerios, seed, `SelectorMiembros` |
| Genaro Aurelio Antonio Pacheco | B3 | F3 | Eventos, calendario, asistencia, anuncios, cartelera pública |
| Oscar Michel Matos May | B4 | F4 | Donaciones, dashboard, reportes PDF/Excel |

Tareas: `docs/README.md` → `docs/{backend,frontend}/<subseccion>/plan.md` → `tasks-*.md`.

## Hechos clave (no olvidar)
- **Usuarios ≠ Miembros.** Solo los usuarios (personal) inician sesión. Los miembros son registros.
- Roles: `ADMIN`, `PASTOR`, `SECRETARIO`, `TESORERO`, `COORDINADOR`. Matriz en `specs.md §3`; código en `config/permisos.ts` (back) y `lib/permisos.ts` (front). Permisos con formato `modulo:accion`.
- Sin registro público: el ADMIN crea usuarios. El seed crea un ADMIN inicial (credenciales en `backend/.env.example` / `seed.ts`).
- Soft delete en usuarios, miembros, ministerios. Donaciones se **anulan** con motivo. Anuncios y horarios sí se borran.
- Donación anónima ⇔ `miembroId = null`.
- Dinero: `Decimal(12,2)` en BD, **string** en JSON.
- Datos financieros se **omiten** de la respuesta si el rol no tiene `donaciones:leer`.
- COORDINADOR solo gestiona asistencia/eventos/integrantes de **sus** ministerios.
- Asistencia ligada a un **evento** (no a una fecha suelta); no se registra en eventos cancelados.
- Respuestas: `{ data, meta? }` / `{ error: { code, message, details? } }`.
- Configuración de la iglesia = fila única (`id = 1`); define moneda (default MXN) y zona horaria (default America/Mexico_City).
- Frontend arranca con MSW (`VITE_USE_MOCKS=true`) para no depender del backend.

## Decisiones
| Fecha | Decisión |
|---|---|
| 2026-10-30 | Stack definido (ver arriba). Propiedad vertical por dominio (B_n + F_n = integrante n). |
| 2026-10-30 | Responsables de evento y vínculos de ministerio apuntan a **Miembro**; coordinadores de ministerio apuntan a **Usuario**. |
| 2026-10-30 | Un solo `schema.prisma`, creado completo por B1 en Fase 0; cambios vía PR revisado por B1. |
| 2026-10-30 | Equipo: Santiago Asahel Pech Ake (B1/F1), Nataly Marisol Santos Miam (B2/F2), Genaro Aurelio Antonio Pacheco (B3/F3), Oscar Michel Matos May (B4/F4). |
| 2026-10-30 | Cartelera pública (`/public/cartelera`) de solo lectura para mostrar anuncios y eventos a los miembros. |

## Estado actual
- **Fase 0 — Arranque**: documentación creada. Código aún no iniciado.
- Siguiente paso: B1-01 (monorepo + Docker) y F1-01 (Vite + Tailwind + shadcn).

## Pendientes / preguntas abiertas
- Confirmar moneda y zona horaria de la iglesia real.
- Definir dónde se desplegará (opcional para la entrega).
