import { prisma } from "@/lib/prisma";

// Promedio y cantidad de reseñas por profesional, para las tarjetas
// comparativas de Cotizaciones. Una sola consulta agrupada para varios
// profesionales a la vez, en vez de una consulta por tarjeta.
export async function getServiceRatings(
  companyIds: string[]
): Promise<Map<string, { average: number; count: number }>> {
  const map = new Map<string, { average: number; count: number }>();
  if (companyIds.length === 0) return map;

  const rows = await prisma.serviceReview.groupBy({
    by: ["companyId"],
    where: { companyId: { in: companyIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  for (const row of rows) {
    map.set(row.companyId, { average: row._avg.rating ?? 0, count: row._count._all });
  }
  return map;
}
