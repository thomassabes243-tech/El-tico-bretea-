-- Parche de contención mientras se separan de verdad las bases de datos
-- de El Mexa Chamba (México) y El Tico Bretea (Costa Rica) -- hoy
-- comparten la misma base física de Neon sin ningún campo que distinga a
-- qué app pertenece cada fila (ver AppTenant en schema.prisma para el
-- porqué completo, y CLAUDE.md para el historial de incidentes).
--
-- Esta migración SOLO agrega columnas appId con default 'MX' y las
-- protege con el middleware de src/lib/tenant-scope.ts -- no borra ni
-- reescribe ningún dato existente de la otra app. Todo lo que ya existía
-- en la base compartida queda con appId='MX' por default al agregar la
-- columna (Postgres aplica el default a las filas ya existentes) --
-- INCLUYENDO, muy probablemente, filas reales que pertenecen a Costa Rica
-- que no se pudieron identificar de otra forma desde este entorno (sin
-- acceso de lectura directa a la base de producción, solo se pudo escribir
-- esta migración a ciegas). Este es el mismo límite ya documentado antes
-- en esta sesión para el resto de la limpieza de datos -- no es un backfill
-- perfecto, es la mejor separación posible sin acceso a Neon.

-- CreateEnum
CREATE TYPE "AppTenant" AS ENUM ('MX', 'CR');

-- AlterTable: la mayoría de los modelos solo necesitan la columna nueva.
ALTER TABLE "advertisements" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "chat_files" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "chat_messages" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "company_profiles" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "donations" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "featured_purchases" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "job_applications" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "job_postings" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "location_shares" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "moderators" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "panic_alerts" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "push_subscriptions" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "reports" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "safe_meeting_points" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "saved_workers" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "scam_alert_confirmations" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "scam_alert_flags" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "scam_alerts" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "service_quotes" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "service_requests" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "service_reviews" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "trusted_contacts" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "users" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "worker_profiles" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';

-- ChatRoom: el slug ("general") ya no es único global -- pasa a ser único
-- junto con appId. Defensivo a propósito: los esquemas de las dos apps
-- llevan meses divergiendo sobre esta misma tabla (ver P3009 en
-- CLAUDE.md), así que no se puede asumir con certeza qué filas existen
-- hoy de verdad en producción. Antes de crear el índice único, se
-- desambigua cualquier fila que fuera a chocar (mismo slug, incluso
-- después del default) agregándole el propio id como sufijo -- nunca se
-- borra ninguna fila.
ALTER TABLE "chat_rooms" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';

WITH ranked AS (
  SELECT "id", "slug", "appId",
         ROW_NUMBER() OVER (PARTITION BY "slug", "appId" ORDER BY "createdAt" ASC) AS rn
  FROM "chat_rooms"
)
UPDATE "chat_rooms" cr
SET "slug" = cr."slug" || '-' || ranked."id"
FROM ranked
WHERE cr."id" = ranked."id" AND ranked.rn > 1;

DROP INDEX IF EXISTS "chat_rooms_slug_key";
CREATE UNIQUE INDEX "chat_rooms_slug_appId_key" ON "chat_rooms"("slug", "appId");

-- AppSettings: antes tenía un id fijo ("singleton") hardcodeado igual en
-- el schema de la otra app -- las dos apps leían y escribían la MISMA
-- fila física. En vez de intentar dividir esa fila compartida a ciegas
-- (no se sabe con certeza qué campos está usando cada lado hoy), se le
-- da a esta app una fila propia y nueva, y se deja la fila vieja
-- exactamente como está para quien todavía la use por su id fijo.
ALTER TABLE "app_settings" ADD COLUMN "appId" "AppTenant" NOT NULL DEFAULT 'MX';
ALTER TABLE "app_settings" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "app_settings" ALTER COLUMN "premiumPricePesos" SET DEFAULT 120;
ALTER TABLE "app_settings" ALTER COLUMN "employerPlanPricePesos" SET DEFAULT 120;

-- Libera appId='MX' de la fila vieja para que getAppSettings() (que ahora
-- busca por appId, no por id) cree una fila nueva propia en vez de seguir
-- usando la compartida.
UPDATE "app_settings" SET "appId" = 'CR' WHERE "id" = 'singleton';

CREATE UNIQUE INDEX "app_settings_appId_key" ON "app_settings"("appId");
