// Listas permitidas de moneda (ISO 4217) y zona horaria (IANA).
// Copia exacta de backend/src/modules/configuracion/configuracion.schemas.ts (B1-15).

export const MONEDAS = {
  MXN: 'Peso mexicano (MXN)',
  USD: 'Dólar estadounidense (USD)',
  EUR: 'Euro (EUR)',
  GTQ: 'Quetzal guatemalteco (GTQ)',
  HNL: 'Lempira hondureño (HNL)',
  COP: 'Peso colombiano (COP)',
  PEN: 'Sol peruano (PEN)',
  CLP: 'Peso chileno (CLP)',
  ARS: 'Peso argentino (ARS)',
} as const;

export const ZONAS_HORARIAS = {
  'America/Mexico_City': 'Ciudad de México (centro)',
  'America/Merida': 'Mérida',
  'America/Cancun': 'Cancún (sureste)',
  'America/Monterrey': 'Monterrey',
  'America/Chihuahua': 'Chihuahua',
  'America/Hermosillo': 'Hermosillo',
  'America/Tijuana': 'Tijuana (noroeste)',
  'America/Guatemala': 'Guatemala',
  'America/Bogota': 'Bogotá',
  'America/Lima': 'Lima',
  'America/Santiago': 'Santiago de Chile',
  'America/Argentina/Buenos_Aires': 'Buenos Aires',
  'America/New_York': 'Nueva York',
  'America/Los_Angeles': 'Los Ángeles',
  'Europe/Madrid': 'Madrid',
} as const;

export type Moneda = keyof typeof MONEDAS;
export type ZonaHoraria = keyof typeof ZONAS_HORARIAS;

export const TIPOS_LOGO = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'] as const;
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
