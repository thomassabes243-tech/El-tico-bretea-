import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Sparkles } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente (no volvió del checkout)",
  COMPLETADA: "Completada",
  FALLIDA: "Falló",
};

export default async function AdminDestacadasPage() {
  const purchases = await prisma.featuredPurchase.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { jobPosting: { include: { company: true } } },
  });
  const totalCentavos = purchases
    .filter((p) => p.status === "COMPLETADA")
    .reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-peso-600" />
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Ofertas destacadas</h1>
      </div>
      <p className="mt-1 text-sm text-navy-800/60">
        Compras de "Destacar oferta", últimas 100. Total recibido (completadas):{" "}
        <strong>${(totalCentavos / 100).toFixed(2)} USD</strong>.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {purchases.length === 0 && (
          <Card className="p-6 text-center text-sm text-navy-800/60">Todavía no hay compras.</Card>
        )}
        {purchases.map((p) => (
          <Card key={p.id} className="flex items-center justify-between gap-3 p-3.5">
            <div className="min-w-0">
              <Link href={`/vacantes/${p.jobPostingId}`} className="truncate text-sm font-bold text-navy-900 hover:underline">
                {p.jobPosting.title}
              </Link>
              <p className="truncate text-xs text-navy-800/50">
                {p.jobPosting.company.commercialName} · ${(p.amountCents / 100).toFixed(2)} USD ·{" "}
                {p.days} días · {(p.completedAt ?? p.createdAt).toLocaleDateString("es-MX")}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                p.status === "COMPLETADA"
                  ? "bg-success-600/10 text-success-600"
                  : p.status === "FALLIDA"
                    ? "bg-mx-red-600/10 text-mx-red-600"
                    : "bg-sand-100 text-navy-800/50"
              }`}
            >
              {STATUS_LABEL[p.status]}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
