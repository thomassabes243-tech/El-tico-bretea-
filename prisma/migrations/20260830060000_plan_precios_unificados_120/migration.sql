-- Decisión explícita e intencional del dueño del producto: los 3 planes de
-- suscripción quedan al mismo precio, $120 MXN/mes. Premium trabajador baja
-- de $1500 y Plan Empleador baja de $250; Plan Profesional (Cotizaciones)
-- ya estaba en $120, no se toca.
--
-- Esto es una migración de DATOS (no solo de esquema): actualiza la fila
-- singleton ya existente en producción, que "prisma migrate deploy" no
-- toca por sí solo (los @default de schema.prisma solo aplican al crear
-- una fila nueva). También pone en NULL los IDs de plan de PayPal de los
-- dos planes cuyo precio cambió, para que /admin/configuracion los marque
-- como "Falta crear" y el botón "Crear/actualizar planes de PayPal" cree
-- los planes nuevos con el precio correcto la próxima vez que se aprete
-- (PayPal no permite editar el monto de un plan ya creado). El Plan
-- Profesional no cambió de precio, así que su ID se deja intacto.
UPDATE "app_settings"
SET
  "premiumPricePesos" = 120,
  "employerPlanPricePesos" = 120,
  "paypalPremiumPlanId" = NULL,
  "paypalEmployerPlanId" = NULL
WHERE "id" = 'singleton';
