import { prisma } from "@/lib/prisma";
import { FREE_ACTIVE_JOBS_LIMIT } from "@/lib/constants";

export async function countActiveJobPostings(companyId: string): Promise<number> {
  return prisma.jobPosting.count({ where: { companyId, isActive: true } });
}

// Nunca bloquea publicar/editar una vacante en sí -- solo si el resultado
// dejaría a la empresa con más vacantes ACTIVAS simultáneas que el límite
// gratis, y no tiene el Plan Empleador. Cerrar una vacante vieja para abrir
// una nueva sigue funcionando siempre, sin pagar nada.
export async function canActivateAnotherJobPosting(
  companyId: string,
  employerPlanActive: boolean
): Promise<boolean> {
  if (employerPlanActive) return true;
  const activeCount = await countActiveJobPostings(companyId);
  return activeCount < FREE_ACTIVE_JOBS_LIMIT;
}
