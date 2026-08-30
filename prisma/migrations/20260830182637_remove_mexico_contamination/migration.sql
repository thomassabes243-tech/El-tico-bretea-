-- Limpieza de contaminación de datos: esta base de datos compartió espacio
-- en el pasado con la otra rama del proyecto ("El Mexa Chamba" / México sin
-- Hambre) antes de que se moviera a su propia base dedicada. Esa rama usaba
-- una cuenta "empresa" placeholder identificable (ver su ai-import.ts):
-- email importado.redes@mexicosinhambre.com, location = 'México'.
-- Se borra esa cuenta -- JobPosting.company tiene onDelete: Cascade, así
-- que se lleva con ella cualquier vacante mexicana colgada. Las 270
-- publicaciones de relleno en Costa Rica (migración anterior,
-- legalId='DEMO_RELLENO') no se tocan.
DELETE FROM "users"
WHERE email = 'importado.redes@mexicosinhambre.com';
