-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDIENTE', 'COMPLETADA', 'FALLIDA');

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "amountPesos" INTEGER NOT NULL,
    "paypalOrderId" TEXT NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDIENTE',
    "payerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donations_paypalOrderId_key" ON "donations"("paypalOrderId");

-- CreateIndex
CREATE INDEX "donations_status_createdAt_idx" ON "donations"("status", "createdAt");
