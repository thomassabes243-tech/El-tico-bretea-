-- isUrgent: lo marca la propia empresa al publicar/editar su vacante.
-- isFeatured ("Brete Premium"): curación editorial, solo el admin la activa.
ALTER TABLE "job_postings" ADD COLUMN "isUrgent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "job_postings" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
