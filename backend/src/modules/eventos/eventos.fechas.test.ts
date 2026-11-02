import { describe, expect, it } from 'vitest';
import { fechaEnZona, finDiaEnZona, inicioDiaEnZona } from './eventos.fechas';

describe('fechas en la zona horaria de la iglesia', () => {
  it('el día empieza a medianoche local, no UTC', () => {
    expect(inicioDiaEnZona('2026-10-31', 'America/Mexico_City').toISOString()).toBe(
      '2026-10-31T06:00:00.000Z',
    );
    expect(finDiaEnZona('2026-10-31', 'America/Mexico_City').toISOString()).toBe(
      '2026-11-01T06:00:00.000Z',
    );
    expect(inicioDiaEnZona('2026-10-31', 'UTC').toISOString()).toBe('2026-10-31T00:00:00.000Z');
  });

  it('respeta el horario de verano (America/New_York)', () => {
    expect(inicioDiaEnZona('2026-07-01', 'America/New_York').toISOString()).toBe(
      '2026-07-01T04:00:00.000Z',
    );
    expect(inicioDiaEnZona('2026-12-01', 'America/New_York').toISOString()).toBe(
      '2026-12-01T05:00:00.000Z',
    );
  });

  it('a las 19:00 de México sigue siendo el mismo día aunque en UTC ya sea mañana', () => {
    expect(fechaEnZona(new Date('2026-11-01T01:00:00.000Z'), 'America/Mexico_City')).toBe(
      '2026-10-31',
    );
  });
});
