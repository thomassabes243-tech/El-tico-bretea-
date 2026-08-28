-- Auto-categorización/auto-publicación desde el chat de Comunidad: marca de
-- origen en cada JobPosting (EMPRESA = publicada normal/importada; ver
-- src/lib/job-auto-detect.ts para CHAT_COMUNIDAD). Defensivo (IF NOT EXISTS)
-- por la misma razón que las migraciones de reparación anteriores -- esta
-- base compartió espacio con otra rama en el pasado.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobPostingOrigin') THEN
    CREATE TYPE "JobPostingOrigin" AS ENUM ('EMPRESA', 'CHAT_COMUNIDAD');
  END IF;
END $$;

ALTER TABLE "job_postings" ADD COLUMN IF NOT EXISTS "origin" "JobPostingOrigin" NOT NULL DEFAULT 'EMPRESA';
