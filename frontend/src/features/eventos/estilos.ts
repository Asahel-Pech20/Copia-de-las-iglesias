import { Briefcase, Church, CircleDot, type LucideIcon, Sparkles, Users } from 'lucide-react';
import type { CategoriaEvento } from '@/types/eventos';

/** Color (token) e ícono de cada categoría: nunca se depende solo del color (WCAG). */
export const ESTILO_CATEGORIA: Record<
  CategoriaEvento,
  { color: string; texto: string; clase: string; icono: LucideIcon }
> = {
  CULTO: {
    color: 'var(--primario)',
    texto: 'var(--primario-texto)',
    clase: 'bg-primario text-primario-texto',
    icono: Church,
  },
  REUNION: {
    color: 'var(--acento)',
    texto: 'var(--acento-texto)',
    clase: 'bg-acento text-acento-texto',
    icono: Users,
  },
  ACTIVIDAD: {
    color: 'var(--exito)',
    texto: 'var(--superficie)',
    clase: 'bg-exito text-superficie',
    icono: Sparkles,
  },
  OTRO: {
    color: 'var(--texto-suave)',
    texto: 'var(--superficie)',
    clase: 'bg-texto-suave text-superficie',
    icono: CircleDot,
  },
};

export const ICONO_TIPO_ADMINISTRATIVO = Briefcase;
