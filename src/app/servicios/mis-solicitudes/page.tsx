import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { Inbox, ChevronRight, Plus, ClipboardList, Clock3, CircleCheckBig } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  ABIERTA: "Esperando cotizaciones",
  CERRADA: "Contratado",
  CANCELADA: "Cancelada",
};

const STATUS_STYLE: Record<string, string> = {
  ABIERTA: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  CERRADA: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  CANCELADA: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
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
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 p-5 text-white shadow-[0_18px_40px_rgba(6,27,51,0.20)]">
          <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-mx-red-600/25 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/15">
                <ClipboardList className="h-5 w-5" />
              </span>
              <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.035em]">Mis solicitudes</h1>
              <p className="mt-1 text-sm leading-relaxed text-white/65">Seguimiento claro de los servicios que pediste.</p>
            </div>
            <Button href="/servicios/nueva" size="sm" className="relative shrink-0">
              <Plus className="h-3.5 w-3.5" /> Nueva
            </Button>
          </div>
          <div className="relative mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-inset ring-white/10">
              <p className="text-xl font-extrabold">{requests.filter((request) => request.status === "ABIERTA").length}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/60"><Clock3 className="h-3 w-3" /> En proceso</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-inset ring-white/10">
              <p className="text-xl font-extrabold">{requests.filter((request) => request.status === "CERRADA").length}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/60"><CircleCheckBig className="h-3 w-3" /> Completadas</p>
            </div>
          </div>
        </section>

        <div className="mt-4 flex flex-col gap-3">
          {requests.length === 0 && (
            <Card className="flex flex-col items-center gap-3 border-0 p-9 text-center shadow-[0_12px_30px_rgba(10,38,71,0.08)]">
              <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-navy-900/[0.06] text-navy-800/35">
                <Inbox className="h-7 w-7" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-navy-900">Todavía no pediste ningún servicio</p>
                <p className="mt-1 text-xs leading-relaxed text-navy-800/50">Publicá lo que necesitás y recibí cotizaciones.</p>
              </div>
              <Button href="/servicios/nueva" variant="secondary" size="sm" className="mt-1">
                Pedir un servicio
              </Button>
            </Card>
          )}
          {requests.map((r) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.value === r.category);
            return (
              <Link key={r.id} href={`/servicios/mis-solicitudes/${r.id}`}>
                <Card className="flex items-center gap-3 border-0 p-4 shadow-[0_8px_22px_rgba(10,38,71,0.07)] transition-transform active:scale-[0.99]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy-900/[0.05] text-2xl">{cat?.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-900">{cat?.label}</p>
                    <p className="mt-1 text-xs text-navy-800/50">{r._count.quotes} cotización{r._count.quotes !== 1 ? "es" : ""} recibida{r._count.quotes !== 1 ? "s" : ""}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[r.status] ?? STATUS_STYLE.CANCELADA}`}>{STATUS_LABEL[r.status]}</span>
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
