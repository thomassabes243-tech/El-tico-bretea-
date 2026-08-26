-- El usuario dio el número de WhatsApp y nombre de contacto para la
-- tarjeta "Solicitar descanso/pausa" (moderadores) y el botón de pago
-- rápido por WhatsApp en /cv, pero esos campos (contactWhatsapp/
-- contactName en app_settings) solo quedaron como columnas vacías en el
-- schema -- nunca se cargó el valor real en producción, porque dependía
-- de que alguien lo escribiera en /admin/configuracion. Se fija acá
-- directamente, igual que se hizo con cvPriceColones.
-- Formato de contactWhatsapp: número local tal como lo tipearía la
-- persona (sin código de país) -- toWhatsappHref le antepone 506.
INSERT INTO "app_settings" ("id", "cvPriceColones", "premiumPriceColones", "contactWhatsapp", "contactName", "updatedAt")
VALUES ('singleton', 1000, 1500, '63222902', 'Misael Barrera Saballos', now())
ON CONFLICT ("id") DO UPDATE SET
  "contactWhatsapp" = '63222902',
  "contactName" = 'Misael Barrera Saballos';
