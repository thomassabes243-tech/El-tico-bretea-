import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { HeartHandshake } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente (no volvió del checkout)",
  COMPLETADA: "Completada",
  FALLIDA: "Falló",
};

export default async function AdminDonacionesPage() {
  const donations = await prisma.donation.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const totalCompletadas = donations
    .filter((d) => d.status === "COMPLETADA")
    .reduce((sum, d) => sum + d.amountPesos, 0);

  return (
    <div>
      <div className="flex items-center gap-2">
        <HeartHandshake className="h-5 w-5 text-navy-700" />
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Donaciones</h1>
      </div>
      <p className="mt-1 text-sm text-navy-800/60">
        Donaciones voluntarias vía PayPal, últimas 100. Total recibido (completadas):{" "}
        <strong>${totalCompletadas.toLocaleString("en-US")} MXN</strong>.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {donations.length === 0 && (
          <Card className="p-6 text-center text-sm text-navy-800/60">Todavía no hay donaciones.</Card>
        )}
        {donations.map((d) => (
          <Card key={d.id} className="flex items-center justify-between gap-3 p-3.5">
            <div>
              <p className="text-sm font-bold text-navy-900">${d.amountPesos.toLocaleString("en-US")} MXN</p>
              <p className="text-xs text-navy-800/50">
                {(d.completedAt ?? d.createdAt).toLocaleString("es-MX")}
                {d.payerEmail && ` · ${d.payerEmail}`}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                d.status === "COMPLETADA"
                  ? "bg-success-600/10 text-success-600"
                  : d.status === "FALLIDA"
                    ? "bg-mx-red-600/10 text-mx-red-600"
                    : "bg-sand-100 text-navy-800/50"
              }`}
            >
              {STATUS_LABEL[d.status]}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
