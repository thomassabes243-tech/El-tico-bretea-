-- AlterTable
ALTER TABLE "scam_alert_flags" ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "scam_alert_flags_resolved_createdAt_idx" ON "scam_alert_flags"("resolved", "createdAt");
