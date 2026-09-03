-- Limpieza de contaminación real de Costa Rica encontrada al investigar el
-- bug "Algo salió mal" en búsqueda por categoría (esa investigación
-- descartó appId como causa del crash, pero confirmó con evidencia directa
-- que hay contenido genuino de Costa Rica en esta base, ej. una vacante en
-- "Curridabat" -- cantón real de San José -- de la empresa "Edificaciones
-- San Rafael", ambas etiquetadas appId='MX' por el punto ciego del backfill
-- original del parche de tenant).
--
-- Identificador usado: el "id" tiene formato UUID (8-4-4-4-12 hex). Ningún
-- código de esta app genera eso nunca -- ni México ni Costa Rica usan
-- @default(uuid()) en su schema.prisma, las dos ramas usan @default(cuid())
-- (confirmado comparando ambos schemas completos), y los ids "cuid" y los
-- de las vacantes de ejemplo ("seed_ejemplo_job_...") no calzan con este
-- patrón -- por eso es seguro para distinguir esta contaminación puntual
-- sin tocar ningún dato real de México.
--
-- onDelete: Cascade en company_profiles (por userId) y en job_postings
-- (por companyId) se lleva con la cuenta todo lo asociado (fotos de
-- portafolio, cotizaciones, etc.).
DELETE FROM "users"
WHERE id IN (
  SELECT u.id FROM "users" u
  JOIN "company_profiles" cp ON cp."userId" = u.id
  WHERE cp.id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- Por separado, cualquier vacante con ese mismo patrón de id que hubiera
-- quedado colgada de una empresa con id normal (no se encontró ningún caso
-- así, pero se cubre por las dudas).
DELETE FROM "job_postings"
WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
