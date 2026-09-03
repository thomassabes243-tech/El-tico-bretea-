-- Confirmación de llegada segura ("Llegué segura") sobre compartir-ubicación
-- (Sección 22) -- gratis para cualquiera, nunca detrás de Premium.
ALTER TABLE "location_shares" ADD COLUMN "confirmedSafeAt" TIMESTAMP(3);
