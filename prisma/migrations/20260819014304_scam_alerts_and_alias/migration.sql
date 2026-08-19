-- CreateEnum
CREATE TYPE "ScamAlertModality" AS ENUM ('PRESENCIAL', 'REMOTO', 'AMBOS');

-- CreateEnum
CREATE TYPE "ScamAlertStatus" AS ENUM ('SIN_VERIFICAR', 'VERIFICADO', 'DESCARTADO');

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "alias" TEXT;

-- AlterTable
ALTER TABLE "worker_profiles" ADD COLUMN     "alias" TEXT;

-- CreateTable
CREATE TABLE "scam_alerts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "offerDescription" TEXT NOT NULL,
    "suspicionReason" TEXT NOT NULL,
    "location" TEXT,
    "modality" "ScamAlertModality",
    "status" "ScamAlertStatus" NOT NULL DEFAULT 'SIN_VERIFICAR',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scam_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scam_alert_confirmations" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scam_alert_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scam_alert_flags" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scam_alert_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scam_alerts_status_createdAt_idx" ON "scam_alerts"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "scam_alert_confirmations_alertId_userId_key" ON "scam_alert_confirmations"("alertId", "userId");

-- AddForeignKey
ALTER TABLE "scam_alerts" ADD CONSTRAINT "scam_alerts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scam_alert_confirmations" ADD CONSTRAINT "scam_alert_confirmations_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "scam_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scam_alert_confirmations" ADD CONSTRAINT "scam_alert_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scam_alert_flags" ADD CONSTRAINT "scam_alert_flags_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "scam_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scam_alert_flags" ADD CONSTRAINT "scam_alert_flags_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
