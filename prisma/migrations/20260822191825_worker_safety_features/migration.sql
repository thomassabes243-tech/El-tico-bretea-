/*
  Warnings:

  - You are about to drop the column `alias` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `alias` on the `worker_profiles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportSeverity" AS ENUM ('NORMAL', 'GRAVE');

-- CreateEnum
CREATE TYPE "LocationShareStatus" AS ENUM ('ACTIVA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "PanicAlertStatus" AS ENUM ('ACTIVA', 'ATENDIDA', 'FALSA_ALARMA');

-- AlterTable
ALTER TABLE "company_profiles" DROP COLUMN "alias";

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "severity" "ReportSeverity" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deviceFingerprint" TEXT;

-- AlterTable
ALTER TABLE "worker_profiles" DROP COLUMN "alias";

-- CreateTable
CREATE TABLE "trusted_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trusted_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_shares" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "trustedContactId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    "suspicionReason" TEXT,
    "shareToken" TEXT NOT NULL,
    "status" "LocationShareStatus" NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "panic_alerts" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "trustedContactId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "note" TEXT,
    "shareToken" TEXT NOT NULL,
    "status" "PanicAlertStatus" NOT NULL DEFAULT 'ACTIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "panic_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safe_meeting_points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safe_meeting_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "location_shares_shareToken_key" ON "location_shares"("shareToken");

-- CreateIndex
CREATE INDEX "location_shares_workerId_createdAt_idx" ON "location_shares"("workerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "panic_alerts_shareToken_key" ON "panic_alerts"("shareToken");

-- CreateIndex
CREATE INDEX "panic_alerts_workerId_status_idx" ON "panic_alerts"("workerId", "status");

-- CreateIndex
CREATE INDEX "safe_meeting_points_city_isActive_idx" ON "safe_meeting_points"("city", "isActive");

-- CreateIndex
CREATE INDEX "reports_targetId_severity_resolved_idx" ON "reports"("targetId", "severity", "resolved");

-- CreateIndex
CREATE INDEX "users_deviceFingerprint_idx" ON "users"("deviceFingerprint");

-- AddForeignKey
ALTER TABLE "trusted_contacts" ADD CONSTRAINT "trusted_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_shares" ADD CONSTRAINT "location_shares_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_shares" ADD CONSTRAINT "location_shares_trustedContactId_fkey" FOREIGN KEY ("trustedContactId") REFERENCES "trusted_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panic_alerts" ADD CONSTRAINT "panic_alerts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "panic_alerts" ADD CONSTRAINT "panic_alerts_trustedContactId_fkey" FOREIGN KEY ("trustedContactId") REFERENCES "trusted_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
