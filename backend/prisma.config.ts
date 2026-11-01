import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Vacío solo permite comandos sin BD (generate, validate); migrate falla con mensaje de Prisma
    url: process.env.DATABASE_URL ?? '',
  },
});
