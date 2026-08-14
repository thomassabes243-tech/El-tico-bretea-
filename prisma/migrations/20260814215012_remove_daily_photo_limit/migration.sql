-- Quita el límite diario de fotos en el chat (a pedido: sin restricción de cantidad)
ALTER TABLE "app_settings" DROP COLUMN "freeDailyFileLimit";
ALTER TABLE "app_settings" DROP COLUMN "companyDailyFileLimit";
