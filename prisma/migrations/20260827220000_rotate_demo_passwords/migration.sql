-- El seed es idempotente (upsert sin tocar passwordHash si el usuario ya
-- existe), así que cambiar SEED_ADMIN_PASSWORD/SEED_MODERATOR_PASSWORD en
-- Vercel no le cambia la contraseña a las cuentas demo que ya están
-- sembradas en producción con las contraseñas de desarrollo documentadas
-- en el README (admin12345 / moderador12345). Esta migración fuerza el
-- reemplazo una sola vez, directo sobre el hash, para las cuentas demo
-- con sus emails por defecto. Si el email fue personalizado vía
-- SEED_ADMIN_EMAIL/SEED_MODERATOR_EMAIL, este UPDATE no encuentra fila y
-- no hace nada (no falla).
UPDATE "users"
SET "passwordHash" = '$2b$10$Nbz265nl6xToew6bCsFDte6I7aOXIyYS8r5zK6X87s18IQ6q6pQQi'
WHERE "email" = 'admin.demo@mexicosinhambre.com';

UPDATE "users"
SET "passwordHash" = '$2b$10$FX1c5p09VuT9431Xs8VlL.Pff1VzIB3PjER4bBg7k2IXTOnmb8.52'
WHERE "email" = 'moderador.demo@mexicosinhambre.com';
