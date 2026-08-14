-- Da el rol de Administrador a la cuenta ya registrada con este correo, a
-- pedido explícito. Es una migración de datos de una sola vez (no un seed
-- recurrente) para no pisar si más adelante se le quita el rol desde el
-- panel. Si la cuenta todavía no existe al momento de aplicar esta
-- migración, no hace nada (0 filas afectadas).
UPDATE "users" SET "role" = 'ADMIN' WHERE "email" = 'tg321920@gmail.com';
