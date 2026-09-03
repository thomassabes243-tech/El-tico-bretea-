-- Sistema de confianza de empleador (punto 5 del audit de seguridad,
-- retomado a pedido explícito del dueño).

-- Categoría estructurada opcional para reportes (hoy solo la usa el picker
-- de ReportButton para targetType JOB_POSTING) -- reason sigue siendo el
-- motivo real en todos los casos, esto solo permite contar por tipo.
CREATE TYPE "ReportReasonCategory" AS ENUM (
  'PAGO_ADELANTADO',
  'PIDE_DATOS_PERSONALES',
  'UBICACION_IDENTIDAD_FALSA',
  'SALARIO_ENGANOSO',
  'ACOSO',
  'SPAM',
  'OTRO'
);

ALTER TABLE "reports" ADD COLUMN "reasonCategory" "ReportReasonCategory";

-- Motivo opcional visible para el contacto de confianza, usado por el botón
-- "Voy a esta entrevista" de /vacantes/[id] (reusa compartir-ubicación en
-- vez de un sistema aparte). NULL para los shares existentes y los que se
-- siguen creando desde /seguridad sin contexto puntual.
ALTER TABLE "location_shares" ADD COLUMN "label" TEXT;
