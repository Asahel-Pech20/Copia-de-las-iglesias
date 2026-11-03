export interface ConfiguracionIglesia {
  nombre: string;
  logoUrl: string | null;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  email: string | null;
  sitioWeb: string | null;
  /** ISO 4217, p. ej. "MXN" */
  moneda: string;
  /** IANA, p. ej. "America/Mexico_City" */
  zonaHoraria: string;
}

export type EditarConfiguracion = Omit<ConfiguracionIglesia, 'logoUrl'>;

export interface HorarioReunion {
  id: string;
  nombre: string;
  /** 0 = domingo … 6 = sábado */
  diaSemana: number;
  /** "HH:mm" */
  horaInicio: string;
  horaFin: string | null;
  lugar: string | null;
  activo: boolean;
}

export type GuardarHorario = Omit<HorarioReunion, 'id'>;
