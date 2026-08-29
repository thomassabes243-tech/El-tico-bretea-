import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { Inbox, MapPin, Phone } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  ENVIADA: "Esperando respuesta",
  ACEPTADA: "¡Te contrataron!",
  RECHAZADA: "No fuiste elegido",
};

export default async function MisCotizacionesPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/registro/empresa");

  const quotes = await prisma.serviceQuote.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: { serviceRequest: true },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Mis cotizaciones enviadas</h1>

        <div className="mt-5 flex flex-col gap-3">
          {quotes.length === 0 && (
            <Card className="flex flex-col items-center gap-2 p-8 text-center">
              <Inbox className="h-7 w-7 text-navy-800/30" />
              <p className="text-sm font-semibold text-navy-900">Todavía no enviaste ninguna cotización</p>
            </Card>
          )}
          {quotes.map((q) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.value === q.serviceRequest.category);
            return (
              <Card key={q.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                    <span>{cat?.emoji}</span> {cat?.label}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      q.status === "ACEPTADA"
                        ? "bg-success-600/10 text-success-600"
                        : q.status === "RECHAZADA"
                          ? "bg-sand-100 text-navy-800/40"
                          : "bg-sand-100 text-navy-800/60"
                    }`}
                  >
                    {STATUS_LABEL[q.status]}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-navy-800/60">{q.serviceRequest.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium text-navy-800/60">
                  <span className="flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5">
                    <MapPin className="h-3 w-3" /> {q.serviceRequest.locationLabel}
                  </span>
                  <span className="rounded-full bg-mx-red-100 px-2 py-0.5 text-mx-red-700">💰 {q.priceLabel}</span>
                </div>

                {/* Contacto del cliente: solo se revela acá, a quien ya cotizó
                    un proyecto grande -- nunca en el listado de solicitudes
                    abiertas. En modo urgente el contacto se coordina al
                    contratar, no antes. */}
                {q.serviceRequest.mode === "PROYECTO" && q.serviceRequest.contactPhone && (
                  <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-success-600/10 px-3 py-2 text-xs font-semibold text-success-600">
                    <Phone className="h-3.5 w-3.5" /> Contacto: {q.serviceRequest.contactPhone}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
