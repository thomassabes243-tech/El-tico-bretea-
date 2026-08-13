import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

const STATIC_PATHS = [
  "",
  "/buscar",
  "/premium",
  "/donar",
  "/acerca-de",
  "/privacidad",
  "/terminos",
  "/contacto",
  "/registro",
  "/registro/trabajador",
  "/registro/empresa",
  "/iniciar-sesion",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const activeJobs = await prisma.jobPosting.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const jobEntries: MetadataRoute.Sitemap = activeJobs.map((job) => ({
    url: `${siteUrl}/vacantes/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticEntries, ...jobEntries];
}
