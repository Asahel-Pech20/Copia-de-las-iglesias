import { Briefcase, Church, CircleDot, type LucideIconData, Sparkles, Users } from 'lucide-angular';
import type { CategoriaEvento } from '@/app/tipos/eventos';

/** Ícono de cada categoría (el color va en las clases `.cat-*` de styles.scss): nunca solo color (WCAG). */
export const ICONO_CATEGORIA: Record<CategoriaEvento, LucideIconData> = {
  CULTO: Church,
  REUNION: Users,
  ACTIVIDAD: Sparkles,
  OTRO: CircleDot,
};

export const ICONO_TIPO_ADMINISTRATIVO = Briefcase;
