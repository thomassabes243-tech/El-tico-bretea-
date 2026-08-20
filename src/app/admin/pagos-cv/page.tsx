import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle, Receipt } from "lucide-react";
import { approveCvClaim, rejectCvClaim } from "./actions";

export default async function AdminPagosCvPage() {
  const claims = await prisma.cvPaymentClaim.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    include: {
      worker: { select: { fullName: true, email: true } },
      reviewedBy: { select: { email: true } },
    },
  });

  const pending = claims.filter((c) => c.status === "PENDIENTE");
  const reviewed = claims.filter((c) => c.status !== "PENDIENTE");

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Pagos de CV</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        {pending.length} comprobante{pending.length !== 1 ? "s" : ""} pendiente
        {pending.length !== 1 ? "s" : ""} de revisión. Aprobar desbloquea la descarga del CV para
        esa persona -- confirmá el código contra tu cuenta de transferencia bancaria antes de aprobar.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {claims.length === 0 && (
          <Card className="flex flex-col items-center gap-2 p-8 text-center text-sm text-navy-800/60">
            <Receipt className="h-6 w-6 text-navy-800/30" />
            Todavía no hay comprobantes enviados.
          </Card>
        )}

        {pending.map((c) => (
          <Card key={c.id} className="p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy-900">{c.worker.fullName}</p>
                <p className="truncate text-xs text-navy-800/50">{c.worker.email}</p>
                <p className="mt-1.5 text-sm font-mono text-navy-800">{c.referenceCode}</p>
                <p className="mt-1 text-[11px] text-navy-800/40">
                  Enviado {c.createdAt.toLocaleDateString("es-CR")} {c.createdAt.toLocaleTimeString("es-CR")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <form action={async () => { "use server"; await approveCvClaim(c.id); }}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-1.5 rounded-lg border border-success-600/30 px-2.5 py-1.5 text-xs font-semibold text-success-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Aprobar
                  </button>
                </form>
                <form action={async () => { "use server"; await rejectCvClaim(c.id); }}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-1.5 rounded-lg border border-mx-red-600/25 px-2.5 py-1.5 text-xs font-semibold text-mx-red-600"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Rechazar
                  </button>
                </form>
              </div>
            </div>
          </Card>
        ))}

        {reviewed.length > 0 && (
          <>
            <h2 className="mt-3 text-xs font-bold uppercase tracking-wide text-navy-800/40">
              Ya revisados
            </h2>
            {reviewed.map((c) => (
              <Card key={c.id} className="p-3.5 opacity-70">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy-900">{c.worker.fullName}</p>
                    <p className="truncate text-xs text-navy-800/50">{c.worker.email}</p>
                    <p className="mt-1.5 text-sm font-mono text-navy-800">{c.referenceCode}</p>
                    <p className="mt-1 text-[11px] text-navy-800/40">
                      Revisado por {c.reviewedBy?.email ?? "—"}
                      {c.reviewedAt && ` · ${c.reviewedAt.toLocaleDateString("es-CR")}`}
                    </p>
                  </div>
                  <Badge tone={c.status === "APROBADO" ? "success" : "neutral"}>
                    {c.status === "APROBADO" ? "Aprobado" : "Rechazado"}
                  </Badge>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
