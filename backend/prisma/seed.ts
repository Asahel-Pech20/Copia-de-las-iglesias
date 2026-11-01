// Seed mínimo (B1-04): configuración de la iglesia y un usuario por rol. Idempotente (upsert).
// B2 extiende este archivo con datos de dominio (B2-12).
import { ROLES } from '../src/config/permisos';
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/seguridad';

const NOMBRES: Record<(typeof ROLES)[number], string> = {
  ADMIN: 'Administrador General',
  PASTOR: 'Pastor General',
  SECRETARIO: 'Secretaría',
  TESORERO: 'Tesorería',
  COORDINADOR: 'Coordinador de Ministerio',
};

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error('Falta SEED_PASSWORD en backend/.env (ver .env.example).');

  await prisma.configuracionIglesia.upsert({
    where: { id: 1 },
    create: { id: 1, nombre: 'Mi Iglesia' },
    update: {},
  });

  const passwordHash = await hashPassword(password);
  for (const rol of ROLES) {
    const email = `${rol.toLowerCase()}@iglesia.local`;
    // update vacío: volver a correr el seed no cambia contraseñas ni datos editados
    await prisma.usuario.upsert({
      where: { email },
      create: { email, nombre: NOMBRES[rol], rol, passwordHash },
      update: {},
    });
  }

  console.warn(`Seed listo: configuración + ${ROLES.length} usuarios (<rol>@iglesia.local).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
