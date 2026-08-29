-- CreateIndex
CREATE INDEX "job_postings_laborCategory_isActive_featuredUntil_idx" ON "job_postings"("laborCategory", "isActive", "featuredUntil");
