-- CreateEnum
CREATE TYPE "JobClosureReason" AS ENUM ('PUESTO_LLENO', 'CADUCADA');

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "closureReason" "JobClosureReason";
