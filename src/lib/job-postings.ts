import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma, JobPosting } from "@prisma/client";

// Tag compartido para invalidar el Data Cache de Next cuando una vacante se
// crea, edita, destaca o cierra -- ver revalidateTag("job-postings") en cada
// ruta que escribe JobPosting. Sin esto el listado público quedaría hasta
// JOB_POSTINGS_REVALIDATE_SECONDS desactualizado tras cada cambio.
export const JOB_POSTINGS_CACHE_TAG = "job-postings";
const JOB_POSTINGS_REVALIDATE_SECONDS = 60;

// El Data Cache de Next serializa a JSON el valor devuelto por una función
// envuelta en unstable_cache -- en un cache HIT, los campos Date vuelven
// como string, no como instancias de Date (rompió en producción:
// "jobPosting.deadline.toLocaleDateString is not a function" en
// /vacantes/[id]). Por eso esto se aplica DESPUÉS de llamar a la función
// cacheada, nunca adentro de ella -- adentro solo corrige el cache miss,
// no los hits, que son la mayoría de las llamadas. new Date(x) funciona
// igual si x ya es un Date, así que es seguro aplicarlo siempre.
function reviveJobPostingDates<T extends JobPosting>(job: T): T {
  return {
    ...job,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
    deadline: job.deadline ? new Date(job.deadline) : null,
    featuredUntil: job.featuredUntil ? new Date(job.featuredUntil) : null,
  };
}

// Sección "Destacar oferta": las vacantes con featuredUntil vigente van
// primero, el resto sigue con el orden cronológico de siempre. Dos consultas
// separadas en vez de un solo orderBy porque el orden de NULLs de Postgres
// para DESC no es el que queremos y esto queda explícito y fácil de leer.
async function fetchJobPostingsFeaturedFirst(where: Prisma.JobPostingWhereInput, take: number) {
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

const cachedFindJobPostingsFeaturedFirst = unstable_cache(
  fetchJobPostingsFeaturedFirst,
  ["job-postings-featured-first"],
  { revalidate: JOB_POSTINGS_REVALIDATE_SECONDS, tags: [JOB_POSTINGS_CACHE_TAG] }
);

// Listados públicos (no cambian por usuario) -- se cachean en el Data Cache
// de Next por un minuto en vez de pegarle a Neon en cada visita. La fecha
// "now" usada adentro queda fija al momento en que se generó la entrada de
// caché, así que una vacante destacada puede tardar hasta un minuto en pasar
// al orden normal cuando vence -- aceptable para este listado.
export async function findJobPostingsFeaturedFirst(where: Prisma.JobPostingWhereInput, take: number) {
  const jobs = await cachedFindJobPostingsFeaturedFirst(where, take);
  return jobs.map(reviveJobPostingDates);
}

const cachedFindJobPostingById = unstable_cache(
  async (id: string) => prisma.jobPosting.findUnique({ where: { id }, include: { company: true } }),
  ["job-posting-by-id"],
  { revalidate: JOB_POSTINGS_REVALIDATE_SECONDS, tags: [JOB_POSTINGS_CACHE_TAG] }
);

// cache() de React memoiza además dentro del mismo request -- generateMetadata
// y el cuerpo de la página piden la misma vacante y antes hacían dos
// findUnique idénticos por visita; ahora es una sola consulta real (la
// segunda la sirve la memoización de request, sin ni pasar por el Data Cache).
export const getJobPostingById = cache(async (id: string) => {
  const job = await cachedFindJobPostingById(id);
  return job ? reviveJobPostingDates(job) : null;
});

export function isFeatured(featuredUntil: Date | null): boolean {
  return Boolean(featuredUntil && featuredUntil > new Date());
}
