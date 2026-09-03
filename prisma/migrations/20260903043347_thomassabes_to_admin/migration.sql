-- Cuenta principal del usuario pasa de MODERATOR a ADMIN para poder usar
-- el panel de administración (/admin/configuracion, precios, usuarios, etc.).
UPDATE "users" SET role = 'ADMIN', "updatedAt" = now()
WHERE email = 'thomassabes243@gmail.com';
