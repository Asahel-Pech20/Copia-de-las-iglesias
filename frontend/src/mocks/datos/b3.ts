import type { PrioridadAnuncio } from '@/app/tipos/anuncios';
import type { CategoriaEvento, EstadoEvento, TipoEvento } from '@/app/tipos/eventos';

// Datos simulados de eventos, asistencia y anuncios (F3). Fechas relativas a hoy para que
// siempre haya eventos de hoy, pasados y próximos. Ids legibles para usarlos en pruebas.

export interface EventoMock {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoEvento;
  categoria: CategoriaEvento;
  fechaInicio: string;
  fechaFin: string | null;
  lugar: string;
  estado: EstadoEvento;
  motivoCancelacion: string | null;
  ministerioId: string | null;
  creadoPorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResponsableMock {
  eventoId: string;
  miembroId: string;
}

export interface AsistenciaMock {
  id: string;
  eventoId: string;
  miembroId: string;
  presente: boolean;
  registradoPorId: string;
  registradoEn: string;
}

export interface AnuncioMock {
  id: string;
  titulo: string;
  contenido: string;
  prioridad: PrioridadAnuncio;
  fechaPublicacion: string;
  fechaExpiracion: string | null;
  eventoId: string | null;
  autorId: string;
  createdAt: string;
  updatedAt: string;
}

/** Fecha ISO de hoy + `dias` a la hora local indicada. */
export function enDias(dias: number, hora = 10, minutos = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minutos, 0, 0);
  return d.toISOString();
}

const creado = '2026-01-10T15:00:00.000Z';

function evento(datos: Partial<EventoMock> & Pick<EventoMock, 'id' | 'titulo' | 'fechaInicio'>) {
  return {
    descripcion: null,
    tipo: 'RELIGIOSO',
    categoria: 'CULTO',
    fechaFin: null,
    lugar: 'Templo principal',
    estado: 'PROGRAMADO',
    motivoCancelacion: null,
    ministerioId: null,
    creadoPorId: 'u-secretario',
    createdAt: creado,
    updatedAt: creado,
    ...datos,
  } satisfies EventoMock;
}

export const eventosIniciales = (): EventoMock[] => [
  evento({
    id: 'ev-culto-pasado',
    titulo: 'Culto dominical',
    fechaInicio: enDias(-7, 10),
    fechaFin: enDias(-7, 12),
    estado: 'REALIZADO',
    descripcion: 'Predicación y santa cena.',
  }),
  evento({
    id: 'ev-culto-hoy',
    titulo: 'Culto de oración',
    fechaInicio: enDias(0, 9),
    fechaFin: enDias(0, 10, 30),
  }),
  evento({
    id: 'ev-jovenes-hoy',
    titulo: 'Reunión de jóvenes',
    categoria: 'REUNION',
    fechaInicio: enDias(0, 18),
    lugar: 'Salón de usos múltiples',
    ministerioId: 'min-jovenes',
    creadoPorId: 'u-coordinador',
  }),
  evento({
    id: 'ev-ensayo',
    titulo: 'Ensayo de alabanza',
    categoria: 'ACTIVIDAD',
    fechaInicio: enDias(2, 19),
    ministerioId: 'min-musica',
  }),
  evento({
    id: 'ev-cancelado',
    titulo: 'Convivencia de jóvenes',
    categoria: 'ACTIVIDAD',
    fechaInicio: enDias(5, 17),
    lugar: 'Parque de la colonia',
    estado: 'CANCELADO',
    motivoCancelacion: 'Pronóstico de lluvia intensa',
    ministerioId: 'min-jovenes',
  }),
  evento({
    id: 'ev-junta',
    titulo: 'Junta administrativa',
    tipo: 'ADMINISTRATIVO',
    categoria: 'REUNION',
    fechaInicio: enDias(10, 20),
    lugar: 'Oficina pastoral',
  }),
];

export const responsablesIniciales = (): ResponsableMock[] => [
  { eventoId: 'ev-culto-pasado', miembroId: 'm-jose' },
  { eventoId: 'ev-ensayo', miembroId: 'm-jose' },
  { eventoId: 'ev-jovenes-hoy', miembroId: 'm-ana' },
];

export const asistenciasIniciales = (): AsistenciaMock[] =>
  [
    ['m-jose', true],
    ['m-maria', true],
    ['m-luis', false],
    ['m-ana', true],
    ['m-pedro', false],
  ].map(([miembroId, presente], i) => ({
    id: `as-${i + 1}`,
    eventoId: 'ev-culto-pasado',
    miembroId: miembroId as string,
    presente: presente as boolean,
    registradoPorId: 'u-secretario',
    registradoEn: enDias(-7, 12),
  }));

export const anunciosIniciales = (): AnuncioMock[] => [
  {
    id: 'an-ayuno',
    titulo: 'Semana de ayuno y oración',
    contenido: 'Te invitamos a unirte **toda la semana**.\n\n- Lunes a viernes\n- 6:00 am',
    prioridad: 'IMPORTANTE',
    fechaPublicacion: enDias(-3),
    fechaExpiracion: enDias(4),
    eventoId: null,
    autorId: 'u-pastor',
    createdAt: creado,
    updatedAt: creado,
  },
  {
    id: 'an-ensayo',
    titulo: 'Ensayo abierto de alabanza',
    contenido: 'Si tocas algún instrumento, ven al ensayo.',
    prioridad: 'NORMAL',
    fechaPublicacion: enDias(-1),
    fechaExpiracion: null,
    eventoId: 'ev-ensayo',
    autorId: 'u-secretario',
    createdAt: creado,
    updatedAt: creado,
  },
  {
    id: 'an-programado',
    titulo: 'Inscripciones al campamento',
    contenido: 'Las inscripciones abren pronto.',
    prioridad: 'NORMAL',
    fechaPublicacion: enDias(3),
    fechaExpiracion: null,
    eventoId: null,
    autorId: 'u-secretario',
    createdAt: creado,
    updatedAt: creado,
  },
  {
    id: 'an-expirado',
    titulo: 'Colecta de víveres',
    contenido: 'Gracias a todos por participar.',
    prioridad: 'NORMAL',
    fechaPublicacion: enDias(-20),
    fechaExpiracion: enDias(-10),
    eventoId: null,
    autorId: 'u-admin',
    createdAt: creado,
    updatedAt: creado,
  },
];
