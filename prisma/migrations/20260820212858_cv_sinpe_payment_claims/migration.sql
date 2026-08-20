-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN "bankTransferAccount" TEXT;
ALTER TABLE "app_settings" ADD COLUMN "bankTransferHolder" TEXT;

-- AlterTable
ALTER TABLE "worker_profiles" ADD COLUMN "cvUnlocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum
CREATE TYPE "CvClaimStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "cv_payment_claims" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "status" "CvClaimStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "cv_payment_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cv_payment_claims_workerId_status_idx" ON "cv_payment_claims"("workerId", "status");

-- AddForeignKey
ALTER TABLE "cv_payment_claims" ADD CONSTRAINT "cv_payment_claims_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cv_payment_claims" ADD CONSTRAINT "cv_payment_claims_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
