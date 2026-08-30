-- La descripción de las 10 empresas reservadas de las vacantes de ejemplo
-- decía literalmente "Cuenta de ejemplo usada para publicar vacantes de
-- relleno..." -- y ese campo SÍ se muestra públicamente en /empresas/[id],
-- alcanzable con un clic desde cualquiera de las 300 vacantes de ejemplo.
-- Se limpia a NULL (el campo es opcional, sin descripción no se muestra
-- nada ahí) para que ningún usuario real vea que es contenido de relleno.
-- El marcador para identificarlas sigue siendo legalId='EJEMPLO', que
-- nunca se renderiza en ninguna pantalla pública (solo se usa en consultas
-- internas / paneles admin).
UPDATE "company_profiles" SET "description" = NULL WHERE "legalId" = 'EJEMPLO';
