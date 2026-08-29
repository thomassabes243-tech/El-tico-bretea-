import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Sección "Destacar oferta": las vacantes con featuredUntil vigente van
// primero, el resto sigue con el orden cronológico de siempre. Dos consultas
// separadas en vez de un solo orderBy porque el orden de NULLs de Postgres
// para DESC no es el que queremos y esto queda explícito y fácil de leer.
export async function findJobPostingsFeaturedFirst(where: Prisma.JobPostingWhereInput, take: number) {
  const now = new Date();
  const [featured, rest] = await Promise.all([
    prisma.jobPosting.findMany({
      where: { ...where, featuredUntil: { gt: now } },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.jobPosting.findMany({
      where: { ...where, OR: [{ featuredUntil: null }, { featuredUntil: { lte: now } }] },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take,
    }),
  ]);
  return [...featured, ...rest].slice(0, take);
}

export function isFeatured(featuredUntil: Date | null): boolean {
  return Boolean(featuredUntil && featuredUntil > new Date());
}
