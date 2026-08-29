import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { ReportButton } from "@/components/forms/ReportButton";
import { SERVICE_CATEGORIES, PROJECT_MAX_QUOTES } from "@/lib/constants";
import { DistanceBadge } from "@/components/servicios/DistanceBadge";
import { MapPin, Inbox, ChevronRight, ClipboardList } from "lucide-react";

export default async function SolicitudesDisponiblesPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/registro/empresa");
  if (!company.offersServices) redirect("/empresa/servicios");

  const openRequests = await prisma.serviceRequest.findMany({
    where: {
      status: "ABIERTA",
      category: { in: company.serviceCategories },
      quotes: { none: { companyId: company.id } },
    },
    orderBy: { createdAt: "desc" },
    include: { requester: { select: { id: true } }, _count: { select: { quotes: true } } },
    take: 40,
  });
  // Un proyecto que ya llegó al tope de cotizaciones no acepta más -- no
  // tiene sentido mostrarlo en la bandeja aunque siga técnicamente "abierta"
  // hasta que el cliente elija a alguien.
  const requests = openRequests.filter(
    (r) => r.mode !== "PROYECTO" || r._count.quotes < PROJECT_MAX_QUOTES
  );

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Solicitudes para vos</h1>
          <Link href="/servicios/mis-cotizaciones" className="text-xs font-semibold text-mx-red-600">
            Mis cotizaciones
          </Link>
        </div>
        <p className="mt-1 text-sm text-navy-800/60">
          Según los servicios que ofrecés. Respondé con tu precio y disponibilidad.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {requests.length === 0 && (
            <Card className="flex flex-col items-center gap-2 p-8 text-center">
              <Inbox className="h-7 w-7 text-navy-800/30" />
              <p className="text-sm font-semibold text-navy-900">No hay solicitudes nuevas</p>
              <p className="text-xs text-navy-800/50">Te avisamos acá apenas aparezca una en tu zona.</p>
            </Card>
          )}
          {requests.map((r) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.value === r.category);

            return (
              <Card key={r.id} className="p-4">
                <Link href={`/servicios/solicitudes/${r.id}/cotizar`} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl">{cat?.emoji}</span>
                      <div>
                        <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                          {cat?.label}
                          {r.mode === "PROYECTO" && (
                            <span className="flex items-center gap-1 rounded-full bg-peso-100 px-2 py-0.5 text-[10px] font-bold text-peso-700">
                              <ClipboardList className="h-2.5 w-2.5" /> Proyecto
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-navy-800/60">{r.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-navy-800/30" />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-medium text-navy-800/60">
                    <span className="flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5">
                      <MapPin className="h-3 w-3" /> {r.locationLabel}
                    </span>
                    <DistanceBadge
                      aLat={r.latitude}
                      aLon={r.longitude}
                      bLat={company.serviceLatitude}
                      bLon={company.serviceLongitude}
                    />
                    {r.budgetLabel && (
                      <span className="rounded-full bg-mx-red-100 px-2 py-0.5 text-mx-red-700">
                        💰 {r.budgetLabel}
                      </span>
                    )}
                    {r.mode === "PROYECTO" && (
                      <span className="rounded-full bg-sand-100 px-2 py-0.5">
                        {r._count.quotes}/{PROJECT_MAX_QUOTES} cotizaciones
                      </span>
                    )}
                  </div>
                </Link>
                <div className="mt-2">
                  <ReportButton
                    targetUserId={r.requester.id}
                    targetType="USER"
                    contextLabel={`Solicitud de servicio: ${cat?.label}`}
                    isLoggedIn={Boolean(session.user)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
