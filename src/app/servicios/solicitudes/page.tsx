import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { ReportButton } from "@/components/forms/ReportButton";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { distanceKm } from "@/lib/geo";
import { MapPin, Inbox, ChevronRight } from "lucide-react";

export default async function SolicitudesDisponiblesPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/registro/empresa");
  if (!company.offersServices) redirect("/empresa/servicios");

  const requests = await prisma.serviceRequest.findMany({
    where: {
      status: "ABIERTA",
      category: { in: company.serviceCategories },
      quotes: { none: { companyId: company.id } },
    },
    orderBy: { createdAt: "desc" },
    include: { requester: { select: { id: true } } },
    take: 30,
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Solicitudes para vos</h1>
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
            const km =
              r.latitude != null &&
              r.longitude != null &&
              company.serviceLatitude != null &&
              company.serviceLongitude != null
                ? distanceKm(r.latitude, r.longitude, company.serviceLatitude, company.serviceLongitude)
                : null;

            return (
              <Card key={r.id} className="p-4">
                <Link href={`/servicios/solicitudes/${r.id}/cotizar`} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl">{cat?.emoji}</span>
                      <div>
                        <p className="text-sm font-bold text-navy-900">{cat?.label}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-navy-800/60">{r.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-navy-800/30" />
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-medium text-navy-800/60">
                    <span className="flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5">
                      <MapPin className="h-3 w-3" /> {r.locationLabel}
                    </span>
                    {km != null && (
                      <span className="rounded-full bg-sand-100 px-2 py-0.5">📍 {km.toFixed(1)} km</span>
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
