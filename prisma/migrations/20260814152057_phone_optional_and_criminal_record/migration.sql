-- AlterTable
ALTER TABLE "company_profiles" ALTER COLUMN "contactPhone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "worker_profiles" ADD COLUMN     "criminalRecordKey" TEXT,
ADD COLUMN     "criminalRecordUploadedAt" TIMESTAMP(3),
ALTER COLUMN "phone" DROP NOT NULL;
