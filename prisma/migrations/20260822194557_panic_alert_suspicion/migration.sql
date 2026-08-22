-- AlterTable
ALTER TABLE "panic_alerts" ADD COLUMN     "suspicionReason" TEXT,
ADD COLUMN     "suspicious" BOOLEAN NOT NULL DEFAULT false;
