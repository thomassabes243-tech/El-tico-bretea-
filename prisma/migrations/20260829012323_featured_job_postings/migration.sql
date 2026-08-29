-- CreateEnum
CREATE TYPE "FeaturedPurchaseStatus" AS ENUM ('PENDIENTE', 'COMPLETADA', 'FALLIDA');

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "featuredUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "featured_purchases" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,
    "paypalOrderId" TEXT NOT NULL,
    "status" "FeaturedPurchaseStatus" NOT NULL DEFAULT 'PENDIENTE',
    "payerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "featured_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "featured_purchases_paypalOrderId_key" ON "featured_purchases"("paypalOrderId");

-- CreateIndex
CREATE INDEX "featured_purchases_status_createdAt_idx" ON "featured_purchases"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "featured_purchases" ADD CONSTRAINT "featured_purchases_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
