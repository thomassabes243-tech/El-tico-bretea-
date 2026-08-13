import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { EyeOff, Eye, ExternalLink } from "lucide-react";
import { toggleJobPostingActive } from "./actions";

export default async function AdminVacantesPage() {
  const jobPostings = await prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { company: { select: { commercialName: true } }, _count: { select: { applications: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Vacantes</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        {jobPostings.length} vacantes publicadas por todas las empresas.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {jobPostings.map((job) => (
          <Card key={job.id} className="flex items-center gap-3 p-3.5">
            <CategoryIcon category={job.laborCategory} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-900">{job.title}</p>
              <p className="truncate text-xs text-navy-800/50">
                {job.company.commercialName} · {job._count.applications} aplicante
                {job._count.applications !== 1 ? "s" : ""}
                {!job.isActive && " · Inactiva"}
              </p>
            </div>
            <Link href={`/vacantes/${job.id}`} target="_blank" className="shrink-0 text-navy-800/40" title="Ver vacante">
              <ExternalLink className="h-4 w-4" />
            </Link>
            <form
              action={async () => {
                "use server";
                await toggleJobPostingActive(job.id, !job.isActive);
              }}
            >
              <button
                type="submit"
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                  job.isActive ? "border-sand-200 text-navy-800/70" : "border-success-600/30 text-success-600"
                }`}
              >
                {job.isActive ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> Desactivar
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Activar
                  </>
                )}
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
