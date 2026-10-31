import 'dotenv/config';
import { z } from 'zod';

const esquemaEnv = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_TEST: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  FRONTEND_URL: z.url(),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_FROM: z.string().default('AppIglesia <no-reply@iglesia.local>'),
  UPLOAD_DIR: z.string().default('uploads'),
});

export type Env = z.infer<typeof esquemaEnv>;

// Valida las variables y lanza un error legible con todas las que faltan o son inválidas
export function validarEnv(fuente: NodeJS.ProcessEnv): Env {
  const resultado = esquemaEnv.safeParse(fuente);
  if (!resultado.success) {
    const lista = resultado.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Variables de entorno inválidas o faltantes:\n${lista}\nRevisa backend/.env (copia de .env.example).`,
    );
  }
  return resultado.data;
}

function cargarEnv(): Env {
  try {
    return validarEnv(process.env);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

export const env = cargarEnv();
