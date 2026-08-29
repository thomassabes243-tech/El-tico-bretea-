import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { ServiceQuoteForm } from "@/components/forms/ServiceQuoteForm";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { MapPin } from "lucide-react";

export default async function CotizarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  const { id } = await params;
  const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!serviceRequest || serviceRequest.status !== "ABIERTA") notFound();

  const cat = SERVICE_CATEGORIES.find((c) => c.value === serviceRequest.category);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <span className="text-xl">{cat?.emoji}</span> {cat?.label}
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm text-navy-800/75">{serviceRequest.description}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-navy-800/50">
            <MapPin className="h-3.5 w-3.5" /> {serviceRequest.locationLabel}
          </p>
        </Card>

        <div className="mt-5">
          <ServiceQuoteForm serviceRequestId={serviceRequest.id} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
