-- Segunda ola de contaminación real de Costa Rica, encontrada minutos
-- después de que la migración anterior (20260903020000) se aplicara y
-- confirmara limpia contra producción -- evidencia directa de que el
-- problema de fondo (los dos proyectos de Vercel comparten la misma base
-- de Neon y ambos corren "prisma migrate deploy" en cualquier deploy de
-- cualquier rama) sigue activo: minutos después de limpiar la contaminación
-- puntual encontrada la primera vez, apareció una tanda NUEVA y más grande,
-- con empresas y vacantes distintas a las de la primera ola.
--
-- Confirmado contra producción real (fetch directo a /buscar/<categoria>):
-- /buscar/construccion y /buscar/seguridad quedaron 100% (30/30) ocupadas
-- por vacantes de Costa Rica (Curridabat, Cartago, Heredia, Alajuela,
-- Tibás, Escazú, Moravia, Grecia, San Carlos, Desamparados, San José,
-- Limón, Liberia, Quepos, Santa Cruz, Turrialba, Nicoya, Puntarenas --
-- cantones/ciudades reales de Costa Rica, ninguna mexicana) bajo 7 empresas
-- nuevas ("Edificaciones San Rafael", "Obras y Acabados Ticos",
-- "Constructora Volcán Verde", "Grupo Constructor Alfa", "Grupo de
-- Seguridad Escudo", "Protección Total S.A.", "Seguridad Vigilantes CR").
-- /buscar/ventas_comercio tenía el mismo patrón (30/30, empresas
-- "Distribuidora Nacional CR", "Tienda El Buen Precio", "Comercial San
-- José"). Las otras 7 categorías (tecnologia, restaurantes, limpieza,
-- transporte, profesionales, oficinas_administracion, hoteles_turismo)
-- se revisaron y siguen limpias -- solo las empresas de ejemplo propias
-- ("Empresa de Tecnología", "Restaurante Local", etc.) con appId correcto.
--
-- Mismo identificador seguro que la primera ola y por el mismo motivo (ver
-- comentario de 20260903020000_borrar_contaminacion_cr_ids_uuid): el "id"
-- de cada empresa y cada vacante de esta tanda nueva tiene formato UUID
-- (8-4-4-4-12 hex), un formato que ningún código de esta app genera nunca
-- (México y Costa Rica usan @default(cuid()), no @default(uuid())).
DELETE FROM "users"
WHERE id IN (
  SELECT u.id FROM "users" u
  JOIN "company_profiles" cp ON cp."userId" = u.id
  WHERE cp.id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

DELETE FROM "job_postings"
WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
