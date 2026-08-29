import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { Inbox, ChevronRight, Plus } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  ABIERTA: "Esperando cotizaciones",
  CERRADA: "Contratado",
  CANCELADA: "Cancelada",
};

export default async function MisSolicitudesPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  const requests = await prisma.serviceRequest.findMany({
    where: { requesterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { quotes: true } } },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Mis solicitudes</h1>
          <Button href="/servicios/nueva" size="sm" variant="secondary">
            <Plus className="h-3.5 w-3.5" /> Nueva
          </Button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {requests.length === 0 && (
            <Card className="flex flex-col items-center gap-2.5 p-8 text-center">
              <Inbox className="h-8 w-8 text-navy-800/30" />
              <p className="text-sm font-semibold text-navy-900">Todavía no pediste ningún servicio</p>
              <Button href="/servicios/nueva" variant="secondary" size="sm" className="mt-1">
                Pedir un servicio
              </Button>
            </Card>
          )}
          {requests.map((r) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.value === r.category);
            return (
              <Link key={r.id} href={`/servicios/mis-solicitudes/${r.id}`}>
                <Card className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{cat?.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-900">{cat?.label}</p>
                    <p className="text-xs text-navy-800/50">
                      {STATUS_LABEL[r.status]} · {r._count.quotes} cotización{r._count.quotes !== 1 ? "es" : ""}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-navy-800/30" />
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
