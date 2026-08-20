"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { applicationStatusMeta } from "@/lib/application-status";

export type MyApplication = {
  id: string;
  status: string;
  createdAt: string;
  jobPosting: {
    id: string;
    title: string;
    laborCategory: string;
    isActive: boolean;
    company: { commercialName: string };
  };
};

// Activa: la vacante sigue abierta y la aplicación no fue descartada.
// Finalizada: la empresa la descartó, o la vacante ya se cerró.
function isActiveApplication(app: MyApplication) {
  return app.jobPosting.isActive && app.status !== "DESCARTADA";
}

export function MyApplicationsTabs({ applications }: { applications: MyApplication[] }) {
  const [tab, setTab] = useState<"activas" | "finalizadas">("activas");

  const activas = applications.filter(isActiveApplication);
  const finalizadas = applications.filter((a) => !isActiveApplication(a));
  const shown = tab === "activas" ? activas : finalizadas;

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="Todavía no aplicaste a ningún brete"
        description="Cuando aplicás a una vacante, el seguimiento aparece acá."
        action={{ label: "Buscar bretes", href: "/buscar" }}
        className="mt-3 border-none bg-sand-50 p-6 shadow-none"
      />
    );
  }

  return (
    <div className="mt-3">
      <div className="flex border-b border-sand-200">
        <button
          type="button"
          onClick={() => setTab("activas")}
          className={`flex-1 border-b-2 pb-2.5 text-center text-xs font-bold transition-colors ${
            tab === "activas" ? "border-navy-900 text-navy-900" : "border-transparent text-navy-800/50"
          }`}
        >
          Activas ({activas.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("finalizadas")}
          className={`flex-1 border-b-2 pb-2.5 text-center text-xs font-bold transition-colors ${
            tab === "finalizadas" ? "border-navy-900 text-navy-900" : "border-transparent text-navy-800/50"
          }`}
        >
          Finalizadas ({finalizadas.length})
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="py-6 text-center text-xs text-navy-800/50">
          No tenés aplicaciones {tab === "activas" ? "activas" : "finalizadas"}.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-2.5">
          {shown.map((app) => {
            const statusMeta = applicationStatusMeta(app.status);
            return (
              <Link key={app.id} href={`/vacantes/${app.jobPosting.id}`}>
                <div className="rounded-xl border border-sand-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <CategoryIcon category={app.jobPosting.laborCategory} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-900">{app.jobPosting.title}</p>
                        <p className="truncate text-xs text-navy-800/50">{app.jobPosting.company.commercialName}</p>
                      </div>
                    </div>
                    <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[11px] text-navy-800/40">
                      Postulado: {new Date(app.createdAt).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-navy-800/60">
                      Ver detalles <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
