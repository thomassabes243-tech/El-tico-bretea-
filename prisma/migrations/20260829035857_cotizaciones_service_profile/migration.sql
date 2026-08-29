-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('ELECTRICISTAS', 'PLOMEROS', 'ALBANILES', 'PINTORES', 'JARDINEROS', 'LIMPIEZA', 'AIRE_ACONDICIONADO', 'MECANICOS', 'CARPINTEROS', 'TECNICOS_CELULARES', 'TECNICOS_COMPUTADORAS', 'MUDANZAS', 'REPARACIONES', 'BELLEZA', 'CUIDADO_MASCOTAS', 'CUIDADO_NINOS', 'CLASES', 'FOTOGRAFIA', 'EVENTOS');

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "offersServices" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "serviceCategories" "ServiceCategory"[],
ADD COLUMN     "serviceDescription" TEXT,
ADD COLUMN     "serviceLatitude" DOUBLE PRECISION,
ADD COLUMN     "serviceLongitude" DOUBLE PRECISION,
ADD COLUMN     "serviceZoneLabel" TEXT;

-- CreateTable
CREATE TABLE "portfolio_photos" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_photos_companyId_idx" ON "portfolio_photos"("companyId");

-- AddForeignKey
ALTER TABLE "portfolio_photos" ADD CONSTRAINT "portfolio_photos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
