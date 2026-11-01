-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'PASTOR', 'SECRETARIO', 'TESORERO', 'COORDINADOR');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('RELIGIOSO', 'ADMINISTRATIVO');

-- CreateEnum
CREATE TYPE "CategoriaEvento" AS ENUM ('CULTO', 'REUNION', 'ACTIVIDAD', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('PROGRAMADO', 'CANCELADO', 'REALIZADO');

-- CreateEnum
CREATE TYPE "ConceptoDonacion" AS ENUM ('DIEZMO', 'OFRENDA', 'PRIMICIA', 'DONACION_ESPECIAL', 'OTRO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CHEQUE', 'OTRO');

-- CreateEnum
CREATE TYPE "PrioridadAnuncio" AS ENUM ('NORMAL', 'IMPORTANTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "revocadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "miembros" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fechaIngreso" DATE NOT NULL,
    "fechaNacimiento" DATE,
    "direccion" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaBaja" DATE,
    "motivoBaja" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "miembros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministerios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ministerios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministerio_coordinadores" (
    "ministerioId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "ministerio_coordinadores_pkey" PRIMARY KEY ("ministerioId","usuarioId")
);

-- CreateTable
CREATE TABLE "miembro_ministerios" (
    "miembroId" TEXT NOT NULL,
    "ministerioId" TEXT NOT NULL,
    "fechaUnion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaSalida" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "miembro_ministerios_pkey" PRIMARY KEY ("miembroId","ministerioId")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoEvento" NOT NULL,
    "categoria" "CategoriaEvento" NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "lugar" TEXT NOT NULL,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'PROGRAMADO',
    "motivoCancelacion" TEXT,
    "ministerioId" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evento_responsables" (
    "eventoId" TEXT NOT NULL,
    "miembroId" TEXT NOT NULL,

    CONSTRAINT "evento_responsables_pkey" PRIMARY KEY ("eventoId","miembroId")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "miembroId" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "registradoPorId" TEXT NOT NULL,
    "registradoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anuncios" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "prioridad" "PrioridadAnuncio" NOT NULL DEFAULT 'NORMAL',
    "fechaPublicacion" TIMESTAMP(3) NOT NULL,
    "fechaExpiracion" TIMESTAMP(3),
    "eventoId" TEXT,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anuncios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "concepto" "ConceptoDonacion" NOT NULL,
    "conceptoDetalle" TEXT,
    "metodo" "MetodoPago" NOT NULL,
    "miembroId" TEXT,
    "anonima" BOOLEAN NOT NULL DEFAULT false,
    "referencia" TEXT,
    "notas" TEXT,
    "anulada" BOOLEAN NOT NULL DEFAULT false,
    "motivoAnulacion" TEXT,
    "anuladaEn" TIMESTAMP(3),
    "registradoPorId" TEXT NOT NULL,
    "actualizadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_iglesia" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "logoUrl" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "zonaHoraria" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_iglesia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_reunion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT,
    "lugar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_reunion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuarioId_idx" ON "refresh_tokens"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_usuarioId_idx" ON "password_reset_tokens"("usuarioId");

-- CreateIndex
CREATE INDEX "miembros_apellidos_nombre_idx" ON "miembros"("apellidos", "nombre");

-- CreateIndex
CREATE INDEX "miembros_activo_idx" ON "miembros"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "ministerios_nombre_key" ON "ministerios"("nombre");

-- CreateIndex
CREATE INDEX "ministerio_coordinadores_usuarioId_idx" ON "ministerio_coordinadores"("usuarioId");

-- CreateIndex
CREATE INDEX "miembro_ministerios_ministerioId_idx" ON "miembro_ministerios"("ministerioId");

-- CreateIndex
CREATE INDEX "eventos_fechaInicio_idx" ON "eventos"("fechaInicio");

-- CreateIndex
CREATE INDEX "eventos_ministerioId_idx" ON "eventos"("ministerioId");

-- CreateIndex
CREATE INDEX "asistencias_miembroId_idx" ON "asistencias"("miembroId");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_eventoId_miembroId_key" ON "asistencias"("eventoId", "miembroId");

-- CreateIndex
CREATE INDEX "anuncios_fechaPublicacion_idx" ON "anuncios"("fechaPublicacion");

-- CreateIndex
CREATE INDEX "donaciones_fecha_idx" ON "donaciones"("fecha");

-- CreateIndex
CREATE INDEX "donaciones_miembroId_idx" ON "donaciones"("miembroId");

-- CreateIndex
CREATE INDEX "horarios_reunion_diaSemana_horaInicio_idx" ON "horarios_reunion"("diaSemana", "horaInicio");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministerio_coordinadores" ADD CONSTRAINT "ministerio_coordinadores_ministerioId_fkey" FOREIGN KEY ("ministerioId") REFERENCES "ministerios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministerio_coordinadores" ADD CONSTRAINT "ministerio_coordinadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembro_ministerios" ADD CONSTRAINT "miembro_ministerios_miembroId_fkey" FOREIGN KEY ("miembroId") REFERENCES "miembros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "miembro_ministerios" ADD CONSTRAINT "miembro_ministerios_ministerioId_fkey" FOREIGN KEY ("ministerioId") REFERENCES "ministerios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_ministerioId_fkey" FOREIGN KEY ("ministerioId") REFERENCES "ministerios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_responsables" ADD CONSTRAINT "evento_responsables_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_responsables" ADD CONSTRAINT "evento_responsables_miembroId_fkey" FOREIGN KEY ("miembroId") REFERENCES "miembros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_miembroId_fkey" FOREIGN KEY ("miembroId") REFERENCES "miembros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anuncios" ADD CONSTRAINT "anuncios_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_miembroId_fkey" FOREIGN KEY ("miembroId") REFERENCES "miembros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_actualizadoPorId_fkey" FOREIGN KEY ("actualizadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

