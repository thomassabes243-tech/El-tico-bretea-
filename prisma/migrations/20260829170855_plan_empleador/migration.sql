-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "employerPlanPricePesos" INTEGER NOT NULL DEFAULT 250,
ADD COLUMN     "paypalEmployerPlanId" TEXT;

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "employerPaypalSubscriptionId" TEXT,
ADD COLUMN     "employerPlanActive" BOOLEAN NOT NULL DEFAULT false;
