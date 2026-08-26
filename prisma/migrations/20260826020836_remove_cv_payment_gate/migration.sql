-- DropForeignKey
ALTER TABLE "cv_payment_claims" DROP CONSTRAINT IF EXISTS "cv_payment_claims_reviewedById_fkey";
ALTER TABLE "cv_payment_claims" DROP CONSTRAINT IF EXISTS "cv_payment_claims_workerId_fkey";

-- AlterTable: la columna real en esta base puede llamarse bankTransferAccount/
-- bankTransferHolder (nuestro nombre) o sinpeMovilNumber/sinpeMovilName (el
-- nombre de la rama de Costa Rica -- si su versión de una migración anterior
-- con el mismo nombre de carpeta llegó a correr primero contra esta base
-- compartida, mientras el Production Branch de Vercel todavía apuntaba ahí,
-- Prisma la da por aplicada y nunca corre la nuestra). Se borran las dos
-- variantes si existen, para no depender de cuál ganó esa carrera.
ALTER TABLE "app_settings"
  DROP COLUMN IF EXISTS "bankTransferAccount",
  DROP COLUMN IF EXISTS "bankTransferHolder",
  DROP COLUMN IF EXISTS "sinpeMovilNumber",
  DROP COLUMN IF EXISTS "sinpeMovilName",
  DROP COLUMN IF EXISTS "contactWhatsapp",
  DROP COLUMN IF EXISTS "contactName",
  DROP COLUMN IF EXISTS "cvPriceColones",
  DROP COLUMN IF EXISTS "premiumPriceColones";

ALTER TABLE "app_settings" ADD COLUMN IF NOT EXISTS "premiumPricePesos" INTEGER NOT NULL DEFAULT 1500;

-- AlterTable
ALTER TABLE "worker_profiles" DROP COLUMN IF EXISTS "cvUnlocked";

-- DropTable
DROP TABLE IF EXISTS "cv_payment_claims";

-- DropEnum
DROP TYPE IF EXISTS "CvClaimStatus";
