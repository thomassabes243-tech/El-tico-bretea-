-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "paypalPremiumPlanId" TEXT,
ADD COLUMN     "paypalProfessionalPlanId" TEXT,
ADD COLUMN     "professionalPricePesos" INTEGER NOT NULL DEFAULT 120;

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "paypalSubscriptionId" TEXT,
ADD COLUMN     "professionalPlanActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "worker_profiles" ADD COLUMN     "paypalSubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_companyId_idx" ON "push_subscriptions"("companyId");

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
