-- CreateEnum
CREATE TYPE "ServiceRequestMode" AS ENUM ('URGENTE', 'PROYECTO');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('ABIERTA', 'CERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "ServiceQuoteStatus" AS ENUM ('ENVIADA', 'ACEPTADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "mode" "ServiceRequestMode" NOT NULL DEFAULT 'URGENTE',
    "description" TEXT NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'ABIERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_quotes" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "priceLabel" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "message" TEXT,
    "status" "ServiceQuoteStatus" NOT NULL DEFAULT 'ENVIADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_requests_category_status_createdAt_idx" ON "service_requests"("category", "status", "createdAt");

-- CreateIndex
CREATE INDEX "service_quotes_serviceRequestId_status_idx" ON "service_quotes"("serviceRequestId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "service_quotes_serviceRequestId_companyId_key" ON "service_quotes"("serviceRequestId", "companyId");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_quotes" ADD CONSTRAINT "service_quotes_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_quotes" ADD CONSTRAINT "service_quotes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
