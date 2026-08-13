import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, RotateCcw, Flag } from "lucide-react";
import { toggleReportResolved } from "./actions";

const TARGET_TYPE_LABELS: Record<string, string> = {
  USER: "Usuario",
  COMPANY: "Empresa",
  JOB_POSTING: "Vacante",
};

export default async function AdminReportesPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    include: {
      reporter: { select: { email: true } },
      target: {
        select: {
          email: true,
          workerProfile: { select: { fullName: true } },
          companyProfile: { select: { commercialName: true } },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Reportes</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        {reports.filter((r) => !r.resolved).length} pendientes de {reports.length} totales.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {reports.length === 0 && (
          <Card className="flex flex-col items-center gap-2 p-8 text-center text-sm text-navy-800/60">
            <Flag className="h-6 w-6 text-navy-800/30" />
            No hay reportes todavía.
          </Card>
        )}
        {reports.map((r) => {
          const targetName =
            r.target?.workerProfile?.fullName ?? r.target?.companyProfile?.commercialName ?? r.target?.email ?? "Usuario eliminado";
          return (
            <Card key={r.id} className={`p-3.5 ${r.resolved ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                    <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-navy-800/60">
                      {TARGET_TYPE_LABELS[r.targetType] ?? r.targetType}
                    </span>
                    <span className="truncate">{targetName}</span>
                  </p>
                  <p className="mt-1 text-xs text-navy-800/70">{r.reason}</p>
                  <p className="mt-1 text-[11px] text-navy-800/40">
                    Reportado por {r.reporter.email} · {r.createdAt.toLocaleDateString("es-CR")}
                  </p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await toggleReportResolved(r.id, !r.resolved);
                  }}
                >
                  <button
                    type="submit"
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      r.resolved ? "border-sand-200 text-navy-800/70" : "border-success-600/30 text-success-600"
                    }`}
                  >
                    {r.resolved ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" /> Reabrir
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolver
                      </>
                    )}
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
