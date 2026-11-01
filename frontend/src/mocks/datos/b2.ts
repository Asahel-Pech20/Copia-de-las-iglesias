import type { Miembro } from '@/types/miembros';

// Datos simulados de miembros y ministerios (F2). Ids legibles para usarlos en pruebas.

export interface MinisterioMock {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VinculoMock {
  miembroId: string;
  ministerioId: string;
  fechaUnion: string;
  fechaSalida: string | null;
  activo: boolean;
}

export interface CoordinacionMock {
  ministerioId: string;
  usuarioId: string;
}

const creado = '2026-01-10T15:00:00.000Z';

function miembro(
  id: string,
  nombre: string,
  apellidos: string,
  fechaIngreso: string,
  extra: Partial<Miembro> = {},
): Miembro {
  return {
    id,
    nombre,
    apellidos,
    telefono: null,
    email: null,
    fechaIngreso,
    fechaNacimiento: null,
    direccion: null,
    notas: null,
    activo: true,
    fechaBaja: null,
    motivoBaja: null,
    createdAt: creado,
    updatedAt: creado,
    ...extra,
  };
}

export const miembrosIniciales = (): Miembro[] => [
  miembro('m-jose', 'José', 'Chan May', '2019-03-10', {
    telefono: '9991234567',
    email: 'jose.chan@gmail.com',
    fechaNacimiento: '1988-07-21',
    direccion: 'Calle 60 #455, Centro',
  }),
  miembro('m-maria', 'María', 'Pech Canul', '2020-06-01', {
    telefono: '9997654321',
    email: 'maria.pech@hotmail.com',
  }),
  miembro('m-luis', 'Luis', 'Aké Novelo', '2021-01-17', { telefono: '9995550101' }),
  miembro('m-ana', 'Ana', 'Pérez Uc', '2022-09-04', { email: 'ana.perez@outlook.com' }),
  miembro('m-pedro', 'Pedro', 'Euán Ku', '2018-11-25', { telefono: '9993332211' }),
  miembro('m-sofia', 'Sofía', 'Núñez Poot', '2023-02-12'),
  miembro('m-daniel', 'Daniel', 'Cauich Tun', '2024-05-19', { telefono: '9998887766' }),
  miembro('m-valeria', 'Valeria', 'Medina Dzul', '2025-08-03', {
    email: 'valeria.medina@gmail.com',
  }),
  miembro('m-rosa', 'Rosa', 'Castillo Ek', '2017-04-30', {
    activo: false,
    fechaBaja: '2026-09-15',
    motivoBaja: 'Se mudó de ciudad',
  }),
  miembro('m-jorge', 'Jorge', 'Ruiz Couoh', '2016-10-08', {
    activo: false,
    fechaBaja: '2026-08-02',
    motivoBaja: null,
  }),
];

export const ministeriosIniciales = (): MinisterioMock[] => [
  {
    id: 'min-jovenes',
    nombre: 'Jóvenes',
    descripcion: 'Reuniones y actividades para jóvenes de 15 a 30 años.',
    activo: true,
    createdAt: creado,
    updatedAt: creado,
  },
  {
    id: 'min-musica',
    nombre: 'Música',
    descripcion: 'Alabanza y adoración en los cultos.',
    activo: true,
    createdAt: creado,
    updatedAt: creado,
  },
  {
    id: 'min-ninos',
    nombre: 'Niños',
    descripcion: 'Escuela dominical.',
    activo: true,
    createdAt: creado,
    updatedAt: creado,
  },
  {
    id: 'min-damas',
    nombre: 'Damas',
    descripcion: null,
    activo: false,
    createdAt: creado,
    updatedAt: creado,
  },
];

const union = '2025-02-01T15:00:00.000Z';

export const vinculosIniciales = (): VinculoMock[] => [
  {
    miembroId: 'm-jose',
    ministerioId: 'min-musica',
    fechaUnion: union,
    fechaSalida: null,
    activo: true,
  },
  {
    miembroId: 'm-jose',
    ministerioId: 'min-jovenes',
    fechaUnion: union,
    fechaSalida: null,
    activo: true,
  },
  {
    miembroId: 'm-ana',
    ministerioId: 'min-jovenes',
    fechaUnion: union,
    fechaSalida: null,
    activo: true,
  },
  {
    miembroId: 'm-daniel',
    ministerioId: 'min-jovenes',
    fechaUnion: union,
    fechaSalida: null,
    activo: true,
  },
  {
    miembroId: 'm-maria',
    ministerioId: 'min-ninos',
    fechaUnion: union,
    fechaSalida: null,
    activo: true,
  },
  {
    miembroId: 'm-luis',
    ministerioId: 'min-jovenes',
    fechaUnion: '2023-01-15T15:00:00.000Z',
    fechaSalida: '2025-06-30T15:00:00.000Z',
    activo: false,
  },
];

/** u-coordinador (mocks/datos/b1.ts) coordina Jóvenes; el pastor, Música */
export const coordinacionesIniciales = (): CoordinacionMock[] => [
  { ministerioId: 'min-jovenes', usuarioId: 'u-coordinador' },
  { ministerioId: 'min-musica', usuarioId: 'u-pastor' },
];
