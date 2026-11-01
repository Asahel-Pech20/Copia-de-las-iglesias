/**
 * Service de miembros (B2). Funciones para otros módulos (B2-06):
 * - `contarActivos()` → número de miembros activos (dashboard, B4).
 * - `obtenerActivos({ ministerioId?, ids? })` → miembros activos sin paginar (asistencia, B3).
 * - `existeActivo(id)` → valida responsables, asistencia y donaciones (B3, B4).
 * - `altasPorMes(desde, hasta)` → `[{ mes: 'yyyy-MM', total }]` (gráfica del dashboard, B4).
 * - `listadoParaReporte({ estado })` → todos los miembros con sus ministerios (reporte RF-09.1, B4).
 * - `idsQueCoinciden(q)` → búsqueda sin acentos ni mayúsculas (la reutiliza ministerios).
 */
import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../../lib/appError';
import { crearMeta, ordenar, paginar } from '../../lib/paginacion';
import { prisma } from '../../lib/prisma';
import type { CrearMiembro, EditarMiembro, EstadoMiembro, QueryMiembros } from './miembros.schemas';

type Cliente = Prisma.TransactionClient | typeof prisma;
type FiltroEstado = QueryMiembros['estado'];

const NO_EXISTE = 'El miembro no existe.';

const SELECT_MIEMBRO = {
  id: true,
  nombre: true,
  apellidos: true,
  telefono: true,
  email: true,
  fechaIngreso: true,
  fechaNacimiento: true,
  direccion: true,
  notas: true,
  activo: true,
  fechaBaja: true,
  motivoBaja: true,
  createdAt: true,
  updatedAt: true,
} as const;

const MINISTERIOS_ACTIVOS = {
  where: { activo: true },
  select: { ministerio: { select: { id: true, nombre: true } } },
  orderBy: { ministerio: { nombre: 'asc' } },
} as const;

// ───────── Fechas @db.Date ↔ "yyyy-MM-dd" (specs.md §7.1) ─────────

/** "yyyy-MM-dd" → Date a medianoche UTC (como lo guarda Postgres en columnas DATE). */
export function aFechaBd(valor: string): Date;
export function aFechaBd(valor: string | null | undefined): Date | null | undefined;
export function aFechaBd(valor: string | null | undefined) {
  return valor ? new Date(`${valor}T00:00:00.000Z`) : valor;
}

/** Date de una columna DATE → "yyyy-MM-dd". */
export function aFechaApi(fecha: Date): string;
export function aFechaApi(fecha: Date | null): string | null;
export function aFechaApi(fecha: Date | null) {
  return fecha ? fecha.toISOString().slice(0, 10) : null;
}

type MiembroBd = Prisma.MiembroGetPayload<{ select: typeof SELECT_MIEMBRO }>;

function formatear<T extends MiembroBd>(m: T) {
  return {
    ...m,
    fechaIngreso: aFechaApi(m.fechaIngreso),
    fechaNacimiento: aFechaApi(m.fechaNacimiento),
    fechaBaja: aFechaApi(m.fechaBaja),
  };
}

function aDatosBd<T extends Partial<CrearMiembro>>(datos: T) {
  return {
    ...datos,
    ...(datos.fechaIngreso !== undefined && { fechaIngreso: aFechaBd(datos.fechaIngreso) }),
    ...(datos.fechaNacimiento !== undefined && {
      fechaNacimiento: aFechaBd(datos.fechaNacimiento),
    }),
  };
}

// ───────── Búsqueda sin acentos ─────────

/** Minúsculas y sin acentos (á→a, ñ→n), igual que el translate de condicionSinAcentos. */
export function normalizarTexto(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

const CON_ACENTO = 'áéíóúüñÁÉÍÓÚÜÑ';
const SIN_ACENTO = 'aeiouunaeiouun';

/**
 * Condición SQL: `expresion` contiene todas las palabras de `q`, sin distinguir mayúsculas
 * ni acentos. null si `q` no tiene palabras. La usa también el módulo de ministerios.
 */
export function condicionSinAcentos(expresion: Prisma.Sql, q: string): Prisma.Sql | null {
  const palabras = normalizarTexto(q).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return null;
  const condiciones = palabras.map((p) => {
    const patron = `%${p.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    return Prisma.sql`translate(lower(${expresion}), ${CON_ACENTO}, ${SIN_ACENTO}) LIKE ${patron}`;
  });
  return Prisma.join(condiciones, ' AND ');
}

/** Ids de miembros cuyo "nombre apellidos" coincide con `q` ("jose" encuentra "José"). */
export async function idsQueCoinciden(q: string, cliente: Cliente = prisma): Promise<string[]> {
  const condicion = condicionSinAcentos(Prisma.sql`nombre || ' ' || apellidos`, q);
  if (!condicion) return [];
  const filas = await cliente.$queryRaw<{ id: string }[]>`
    SELECT id FROM miembros WHERE ${condicion}`;
  return filas.map((f) => f.id);
}

function whereEstado(estado: FiltroEstado): Prisma.MiembroWhereInput {
  return estado === 'todos' ? {} : { activo: estado === 'activo' };
}

// ───────── CRUD ─────────

export async function listar(query: QueryMiembros) {
  const { page, limit, skip, take } = paginar(query);
  const where: Prisma.MiembroWhereInput = {
    ...whereEstado(query.estado),
    ...(query.q && { id: { in: await idsQueCoinciden(query.q) } }),
    ...(query.ministerioId && {
      ministerios: { some: { ministerioId: query.ministerioId, activo: true } },
    }),
  };
  const orden = ordenar(query.orden, ['nombre', 'apellidos', 'fechaIngreso', 'createdAt'], {
    apellidos: 'asc',
  });
  // Desempate estable: apellidos → nombre → id
  const orderBy: Prisma.MiembroOrderByWithRelationInput[] = [
    orden,
    { nombre: 'asc' },
    { id: 'asc' },
  ];
  const [filas, total] = await prisma.$transaction([
    prisma.miembro.findMany({
      where,
      orderBy,
      skip,
      take,
      select: { ...SELECT_MIEMBRO, ministerios: MINISTERIOS_ACTIVOS },
    }),
    prisma.miembro.count({ where }),
  ]);
  const datos = filas.map(({ ministerios, ...m }) => ({
    ...formatear(m),
    ministerios: ministerios.map((v) => v.ministerio),
    totalMinisterios: ministerios.length,
  }));
  return { datos, meta: crearMeta(total, page, limit) };
}

export async function obtener(id: string) {
  const miembro = await prisma.miembro.findUnique({
    where: { id },
    select: {
      ...SELECT_MIEMBRO,
      ministerios: {
        select: {
          fechaUnion: true,
          fechaSalida: true,
          activo: true,
          ministerio: { select: { id: true, nombre: true, activo: true } },
        },
        orderBy: [{ activo: 'desc' }, { fechaUnion: 'desc' }],
      },
    },
  });
  if (!miembro) throw AppError.noEncontrado(NO_EXISTE);
  // El resumen de asistencia (último evento, % en 3 meses) se agregará con asistenciaService (B3)
  const { ministerios, ...datos } = miembro;
  return {
    ...formatear(datos),
    ministerios: ministerios.map(({ ministerio, ...vinculo }) => ({ ...ministerio, ...vinculo })),
  };
}

/** Miembro con el mismo nombre y apellidos (sin mayúsculas ni acentos), si existe. */
async function buscarDuplicado(nombre: string, apellidos: string, exceptoId?: string) {
  const ids = await idsQueCoinciden(`${nombre} ${apellidos}`);
  if (ids.length === 0) return null;
  const candidatos = await prisma.miembro.findMany({
    where: { id: { in: ids.filter((i) => i !== exceptoId) } },
    select: { id: true, nombre: true, apellidos: true },
  });
  const clave = normalizarTexto(`${nombre}|${apellidos}`);
  return candidatos.find((c) => normalizarTexto(`${c.nombre}|${c.apellidos}`) === clave) ?? null;
}

/** Crea el miembro. Si ya hay otro con el mismo nombre, lo indica en `duplicado` (advertencia, no error). */
export async function crear(datos: CrearMiembro) {
  const duplicado = await buscarDuplicado(datos.nombre, datos.apellidos);
  const miembro = await prisma.miembro.create({ data: aDatosBd(datos), select: SELECT_MIEMBRO });
  return { miembro: formatear(miembro), duplicadoId: duplicado?.id ?? null };
}

async function verificarExiste(id: string, cliente: Cliente = prisma) {
  const miembro = await cliente.miembro.findUnique({
    where: { id },
    select: { id: true, activo: true },
  });
  if (!miembro) throw AppError.noEncontrado(NO_EXISTE);
  return miembro;
}

export async function editar(id: string, datos: EditarMiembro) {
  await verificarExiste(id);
  const miembro = await prisma.miembro.update({
    where: { id },
    data: aDatosBd(datos),
    select: SELECT_MIEMBRO,
  });
  return formatear(miembro);
}

/**
 * Desactiva o reactiva. Al desactivar guarda fecha y motivo de baja y cierra sus vínculos de ministerio;
 * al reactivar limpia la baja (los vínculos no se restauran). Asistencias y donaciones se conservan.
 */
export async function cambiarEstado(id: string, { activo, motivo }: EstadoMiembro) {
  return prisma.$transaction(async (tx) => {
    const actual = await verificarExiste(id, tx);
    if (actual.activo === activo) {
      throw AppError.reglaNegocio(
        activo ? 'El miembro ya está activo.' : 'El miembro ya está inactivo.',
      );
    }
    const ahora = new Date();
    if (!activo) {
      await tx.miembroMinisterio.updateMany({
        where: { miembroId: id, activo: true },
        data: { activo: false, fechaSalida: ahora },
      });
    }
    const miembro = await tx.miembro.update({
      where: { id },
      data: activo
        ? { activo, fechaBaja: null, motivoBaja: null }
        : {
            activo,
            fechaBaja: aFechaBd(ahora.toISOString().slice(0, 10)),
            motivoBaja: motivo ?? null,
          },
      select: SELECT_MIEMBRO,
    });
    return formatear(miembro);
  });
}

// ───────── Funciones para otros módulos (B2-06) ─────────

export function contarActivos() {
  return prisma.miembro.count({ where: { activo: true } });
}

/** Miembros activos (sin paginar), opcionalmente de un ministerio o de una lista de ids. */
export function obtenerActivos(filtros: { ministerioId?: string; ids?: string[] } = {}) {
  return prisma.miembro.findMany({
    where: {
      activo: true,
      ...(filtros.ids && { id: { in: filtros.ids } }),
      ...(filtros.ministerioId && {
        ministerios: { some: { ministerioId: filtros.ministerioId, activo: true } },
      }),
    },
    select: { id: true, nombre: true, apellidos: true },
    orderBy: [{ apellidos: 'asc' }, { nombre: 'asc' }],
  });
}

export async function existeActivo(id: string, cliente: Cliente = prisma) {
  const miembro = await cliente.miembro.findUnique({ where: { id }, select: { activo: true } });
  return miembro?.activo === true;
}

/**
 * Altas (fecha de ingreso) por mes entre dos fechas "yyyy-MM-dd", incluyendo meses sin altas.
 * @example await altasPorMes('2026-01-01', '2026-03-31') // [{ mes: '2026-01', total: 3 }, …]
 */
export async function altasPorMes(desde: string, hasta: string) {
  const filas = await prisma.miembro.findMany({
    where: { fechaIngreso: { gte: aFechaBd(desde), lte: aFechaBd(hasta) } },
    select: { fechaIngreso: true },
  });
  const conteo = new Map<string, number>();
  const cursor = new Date(`${desde.slice(0, 7)}-01T00:00:00.000Z`);
  const fin = hasta.slice(0, 7);
  while (cursor.toISOString().slice(0, 7) <= fin) {
    conteo.set(cursor.toISOString().slice(0, 7), 0);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  for (const { fechaIngreso } of filas) {
    const mes = aFechaApi(fechaIngreso).slice(0, 7);
    conteo.set(mes, (conteo.get(mes) ?? 0) + 1);
  }
  return [...conteo].map(([mes, total]) => ({ mes, total }));
}

/** Todos los miembros (sin paginar) con sus ministerios activos, para el reporte general. */
export async function listadoParaReporte(filtros: { estado?: FiltroEstado } = {}) {
  const filas = await prisma.miembro.findMany({
    where: whereEstado(filtros.estado ?? 'activo'),
    select: { ...SELECT_MIEMBRO, ministerios: MINISTERIOS_ACTIVOS },
    orderBy: [{ apellidos: 'asc' }, { nombre: 'asc' }],
  });
  return filas.map(({ ministerios, ...m }) => ({
    ...formatear(m),
    ministerios: ministerios.map((v) => v.ministerio.nombre),
  }));
}
