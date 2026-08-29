-- CreateTable
CREATE TABLE "service_reviews" (
    "id" TEXT NOT NULL,
    "serviceQuoteId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_reviews_serviceQuoteId_key" ON "service_reviews"("serviceQuoteId");

-- CreateIndex
CREATE INDEX "service_reviews_companyId_idx" ON "service_reviews"("companyId");

-- AddForeignKey
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_serviceQuoteId_fkey" FOREIGN KEY ("serviceQuoteId") REFERENCES "service_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
