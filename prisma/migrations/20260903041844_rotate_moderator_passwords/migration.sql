-- Rotación de contraseña por hallazgo de seguridad: la migración anterior
-- (20260903040954_moderator_accounts) dejó la contraseña en texto plano en
-- un comentario SQL, ya en el historial de git. Esta migración SOLO
-- reemplaza el hash -- la contraseña nueva se le dio al usuario fuera de
-- este archivo (chat de la sesión), a propósito, para no repetir el error.
UPDATE "users" SET "passwordHash" = '$2b$10$vbYknQuMwYrR1cYOm24gVeUL5jEHWSNsjxFArJ5CQme9m2a0HMbea', "updatedAt" = now()
WHERE email = 'thomassabes243@gmail.com';

UPDATE "users" SET "passwordHash" = '$2b$10$o.w2kGg86pQ7zACZCCLK7O541v6aH6A0cjLSTDQ8HfsvKLrGwNiZ.', "updatedAt" = now()
WHERE email = 'tg321920@gmail.com';
