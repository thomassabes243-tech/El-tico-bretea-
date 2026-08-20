-- Valor de respaldo para los campos de categoría/disponibilidad/tipo de
-- contrato cuando la persona deja el campo sin llenar. Los formularios de
-- registro, edición de perfil y publicar brete ahora son opcionales salvo
-- correo/contraseña -- este valor evita tener que guardar un dato inventado.
ALTER TYPE "LaborCategory" ADD VALUE 'SIN_ESPECIFICAR';
ALTER TYPE "JobType" ADD VALUE 'SIN_ESPECIFICAR';
ALTER TYPE "Availability" ADD VALUE 'SIN_ESPECIFICAR';
