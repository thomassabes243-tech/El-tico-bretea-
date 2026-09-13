CREATE TYPE "CvCardPaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ERROR');

CREATE TABLE "cv_card_payments" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "amountColones" INTEGER NOT NULL,
    "status" "CvCardPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "tilopayTransactionId" TEXT,
    "authorizationCode" TEXT,
    "environment" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "cv_card_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cv_card_payments_orderNumber_key" ON "cv_card_payments"("orderNumber");
CREATE INDEX "cv_card_payments_workerId_status_idx" ON "cv_card_payments"("workerId", "status");

ALTER TABLE "cv_card_payments"
ADD CONSTRAINT "cv_card_payments_workerId_fkey"
FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_settings"
ALTER COLUMN "premiumPriceColones" SET DEFAULT 4000;

UPDATE "app_settings"
SET "premiumPriceColones" = 4000,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'singleton';
