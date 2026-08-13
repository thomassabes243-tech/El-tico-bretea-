import { prisma } from "@/lib/prisma";
import type { JobPosting, WorkerProfile } from "@prisma/client";

// Sección 19: recomendaciones por categoría, ubicación y disponibilidad,
// con prioridad Premium. Nunca garantizan contratación — son solo una
// forma de ayudar a encontrarse más rápido.

function locationMatches(a: string, b: string) {
  const na = a.toLowerCase();
  const nb = b.toLowerCase();
  return na.includes(nb) || nb.includes(na);
}

export async function recommendWorkersForJob(
  job: Pick<JobPosting, "id" | "laborCategory" | "location">,
  excludeWorkerIds: string[],
  take = 6
) {
  const candidates = await prisma.workerProfile.findMany({
    where: {
      isPublic: true,
      laborCategory: job.laborCategory,
      id: { notIn: excludeWorkerIds },
    },
    orderBy: [{ isPremium: "desc" }, { createdAt: "desc" }],
    take: 30,
  });

  return candidates
    .map((w) => ({
      worker: w,
      locationMatch: locationMatches(w.residence, job.location),
    }))
    .sort((a, b) => {
      if (a.worker.isPremium !== b.worker.isPremium) return a.worker.isPremium ? -1 : 1;
      if (a.locationMatch !== b.locationMatch) return a.locationMatch ? -1 : 1;
      return 0;
    })
    .slice(0, take)
    .map((r) => r.worker);
}

export async function recommendJobsForWorker(
  worker: Pick<WorkerProfile, "id" | "laborCategory" | "residence" | "availability" | "jobTypeSought">,
  take = 4
) {
  const candidates = await prisma.jobPosting.findMany({
    where: { isActive: true, laborCategory: worker.laborCategory },
    include: { company: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return candidates
    .map((job) => ({
      job,
      locationMatch: locationMatches(job.location, worker.residence),
      contractMatch: job.contractType === worker.jobTypeSought,
    }))
    .sort((a, b) => {
      if (a.locationMatch !== b.locationMatch) return a.locationMatch ? -1 : 1;
      if (a.contractMatch !== b.contractMatch) return a.contractMatch ? -1 : 1;
      return 0;
    })
    .slice(0, take)
    .map((r) => r.job);
}
