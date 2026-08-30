-- Corrige datos de prueba/leftover con formato o lugares de Costa Rica que
-- quedaron mezclados en la versión de México (el placeholder de salario en
-- los formularios venía de la versión original en colones, y algún dato de
-- prueba pudo haberse cargado con esos valores de ejemplo antes de que se
-- corrigiera el código). No toca el esquema, solo datos ya existentes.

-- 1) Ubicaciones con nombres de provincias/ciudades de Costa Rica -> ciudad
-- mexicana equivalente. ILIKE + comodines para agarrar variantes como
-- "San José, Costa Rica" o "Provincia de Heredia".
UPDATE "job_postings" SET "location" = 'Ciudad de México' WHERE "location" ILIKE '%san jos%';
UPDATE "job_postings" SET "location" = 'Guadalajara, Jalisco' WHERE "location" ILIKE '%heredia%';
UPDATE "job_postings" SET "location" = 'Monterrey, Nuevo León' WHERE "location" ILIKE '%alajuela%';
UPDATE "job_postings" SET "location" = 'Puebla, Puebla' WHERE "location" ILIKE '%cartago%';
UPDATE "job_postings" SET "location" = 'Cancún, Quintana Roo' WHERE "location" ILIKE '%guanacaste%';
UPDATE "job_postings" SET "location" = 'Acapulco, Guerrero' WHERE "location" ILIKE '%puntarenas%';
UPDATE "job_postings" SET "location" = 'Veracruz, Veracruz' WHERE "location" ILIKE '%lim%n%';
UPDATE "job_postings" SET "location" = 'Ciudad de México' WHERE "location" ILIKE '%costa rica%';

-- Mismo criterio para el perfil de empresa (ubicación de la sede) y del
-- trabajador (ciudad de residencia), por si algún registro de prueba
-- también quedó con un valor de Costa Rica ahí.
UPDATE "company_profiles" SET "location" = 'Ciudad de México' WHERE "location" ILIKE '%san jos%' OR "location" ILIKE '%costa rica%';
UPDATE "company_profiles" SET "location" = 'Guadalajara, Jalisco' WHERE "location" ILIKE '%heredia%';
UPDATE "company_profiles" SET "location" = 'Monterrey, Nuevo León' WHERE "location" ILIKE '%alajuela%';
UPDATE "company_profiles" SET "location" = 'Puebla, Puebla' WHERE "location" ILIKE '%cartago%';
UPDATE "company_profiles" SET "location" = 'Cancún, Quintana Roo' WHERE "location" ILIKE '%guanacaste%';
UPDATE "company_profiles" SET "location" = 'Acapulco, Guerrero' WHERE "location" ILIKE '%puntarenas%';
UPDATE "company_profiles" SET "location" = 'Veracruz, Veracruz' WHERE "location" ILIKE '%lim%n%';

UPDATE "worker_profiles" SET "residence" = 'Ciudad de México' WHERE "residence" ILIKE '%san jos%' OR "residence" ILIKE '%costa rica%';
UPDATE "worker_profiles" SET "residence" = 'Guadalajara, Jalisco' WHERE "residence" ILIKE '%heredia%';
UPDATE "worker_profiles" SET "residence" = 'Monterrey, Nuevo León' WHERE "residence" ILIKE '%alajuela%';
UPDATE "worker_profiles" SET "residence" = 'Puebla, Puebla' WHERE "residence" ILIKE '%cartago%';
UPDATE "worker_profiles" SET "residence" = 'Cancún, Quintana Roo' WHERE "residence" ILIKE '%guanacaste%';
UPDATE "worker_profiles" SET "residence" = 'Acapulco, Guerrero' WHERE "residence" ILIKE '%puntarenas%';
UPDATE "worker_profiles" SET "residence" = 'Veracruz, Veracruz' WHERE "residence" ILIKE '%lim%n%';

-- 2) Salario con escala de colones costarricenses (cientos de miles, sin
-- "MXN") -- venía del placeholder viejo del formulario ("$350,000 -
-- $400,000"), imposible como salario mensual real en pesos mexicanos para
-- estos rubros (el máximo real de la guía de salarios es $30,000). Se
-- limpia en vez de inventar un monto que no sabemos cuál era.
UPDATE "job_postings"
SET "salary" = NULL
WHERE "salary" ~ '\$[1-9][0-9]{2},[0-9]{3}'
  AND "salary" NOT ILIKE '%mxn%';

-- 3) Publicación de prueba visible para cualquiera, con texto que delata
-- que es de prueba ("Vacante de prueba para verificar el flujo de
-- destacar oferta") -- se borra en vez de corregir, para que un usuario
-- real nunca la vea.
DELETE FROM "job_postings" WHERE "description" = 'Vacante de prueba para verificar el flujo de destacar oferta.';
