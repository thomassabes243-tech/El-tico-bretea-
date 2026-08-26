-- El usuario pidió repetidamente que el precio de descarga del CV sea
-- ₡1000. El valor vive en la fila singleton de app_settings, que ya existía
-- en producción con el default viejo (1090) desde antes de que ese default
-- se cambiara en el schema -- cambiar el @default() en schema.prisma no
-- actualiza filas ya creadas, así que había que corregirla a mano acá.
-- Usamos upsert (INSERT ... ON CONFLICT) por si la fila no existiera todavía
-- en algún entorno, pero en producción esto es efectivamente un UPDATE.
INSERT INTO "app_settings" ("id", "cvPriceColones", "premiumPriceColones", "updatedAt")
VALUES ('singleton', 1000, 1500, now())
ON CONFLICT ("id") DO UPDATE SET "cvPriceColones" = 1000;
