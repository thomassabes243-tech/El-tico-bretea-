-- REPARACIÓN: la otra rama que compartía esta misma base de datos
-- (claude/app-second-version-h8ujrh, "Mexico sin Hambre") corrió
-- migraciones propias que BORRARON columnas y una tabla entera que este
-- código sí necesita -- confirmado con los logs reales de error en
-- producción (mcp__Vercel__get_runtime_errors, P2022):
--   - chat_rooms.category no existe
--   - worker_profiles.cvUnlocked no existe
-- y por los mensajes de commit de esa rama ("Quita el cobro por
-- descarga del CV..." y "Arregla choque de nombres de columna..."):
--   - se eliminó el modelo/tabla cv_payment_claims completo
--   - se borraron app_settings.cvPriceColones, contactWhatsapp,
--     contactName, sinpeMovilNumber, sinpeMovilName
-- Esa rama ya se movió a una base de Neon dedicada y separada, así que
-- esto debería ser una reparación de una sola vez, no algo recurrente.
--
-- Todo acá es defensivo (IF NOT EXISTS) para no fallar sin importar el
-- estado real de cada columna/tabla en este momento -- no hay forma de
-- inspeccionar la base de producción desde este entorno antes de migrar.

-- Restaurar el enum y la columna de categoría de sala de chat. Con un
-- solo valor posible en la práctica (CONSTRUCCION, la sala única
-- "Comunidad Tica"), el default cubre cualquier fila existente.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommunityCategory') THEN
    CREATE TYPE "CommunityCategory" AS ENUM ('CONSTRUCCION', 'HOTELES_TURISMO', 'PROFESIONALES');
  END IF;
END $$;

ALTER TABLE "chat_rooms" ADD COLUMN IF NOT EXISTS "category" "CommunityCategory" NOT NULL DEFAULT 'CONSTRUCCION';

-- Restaurar el desbloqueo de descarga de CV.
ALTER TABLE "worker_profiles" ADD COLUMN IF NOT EXISTS "cvUnlocked" BOOLEAN NOT NULL DEFAULT false;

-- Restaurar columnas de configuración (precio, SINPE, contacto).
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "cvPriceColones" INTEGER NOT NULL DEFAULT 1090;
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "premiumPriceColones" INTEGER NOT NULL DEFAULT 1500;
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "sinpeMovilNumber" TEXT;
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "sinpeMovilName" TEXT;
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "contactWhatsapp" TEXT;
ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "contactName" TEXT;

-- Restaurar la tabla completa de reclamos de pago de CV.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CvClaimStatus') THEN
    CREATE TYPE "CvClaimStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "cv_payment_claims" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "status" "CvClaimStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "cv_payment_claims_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "cv_payment_claims_workerId_status_idx" ON "cv_payment_claims"("workerId", "status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cv_payment_claims_workerId_fkey'
  ) THEN
    ALTER TABLE "cv_payment_claims" ADD CONSTRAINT "cv_payment_claims_workerId_fkey"
      FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cv_payment_claims_reviewedById_fkey'
  ) THEN
    ALTER TABLE "cv_payment_claims" ADD CONSTRAINT "cv_payment_claims_reviewedById_fkey"
      FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Re-fijar los valores reales que ya habíamos cargado antes de que la
-- otra rama borrara las columnas (precio ₡1000, WhatsApp y nombre de
-- contacto dados por el usuario).
INSERT INTO "app_settings" ("id", "cvPriceColones", "premiumPriceColones", "contactWhatsapp", "contactName", "updatedAt")
VALUES ('singleton', 1000, 1500, '63222902', 'Misael Barrera Saballos', now())
ON CONFLICT ("id") DO UPDATE SET
  "cvPriceColones" = 1000,
  "contactWhatsapp" = '63222902',
  "contactName" = 'Misael Barrera Saballos';
