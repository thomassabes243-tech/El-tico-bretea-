-- DropForeignKey
ALTER TABLE "cv_payment_claims" DROP CONSTRAINT "cv_payment_claims_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "cv_payment_claims" DROP CONSTRAINT "cv_payment_claims_workerId_fkey";

-- AlterTable
ALTER TABLE "app_settings" DROP COLUMN "bankTransferAccount",
DROP COLUMN "bankTransferHolder",
DROP COLUMN "contactWhatsapp",
DROP COLUMN "cvPriceColones",
DROP COLUMN "premiumPriceColones",
ADD COLUMN     "premiumPricePesos" INTEGER NOT NULL DEFAULT 1500;

-- AlterTable
ALTER TABLE "worker_profiles" DROP COLUMN "cvUnlocked";

-- DropTable
DROP TABLE "cv_payment_claims";

-- DropEnum
DROP TYPE "CvClaimStatus";

