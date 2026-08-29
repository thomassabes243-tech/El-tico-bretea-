import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/layout/AuthShell";
import { ServiceProfileForm } from "@/components/forms/ServiceProfileForm";

export default async function ServiciosPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: { portfolioPhotos: { orderBy: { createdAt: "desc" } } },
  });
  if (!company) redirect("/registro/empresa");

  return (
    <AuthShell
      title="Cotizaciones"
      subtitle="Ofrecé tus servicios a clientes que necesitan un trabajo puntual, además de tus vacantes."
    >
      <ServiceProfileForm
        initialOffersServices={company.offersServices}
        initialCategories={company.serviceCategories}
        initialZoneLabel={company.serviceZoneLabel ?? ""}
        initialDescription={company.serviceDescription ?? ""}
        hasLocation={company.serviceLatitude != null && company.serviceLongitude != null}
        initialPhotos={company.portfolioPhotos.map((p) => ({
          id: p.id,
          url: `/api/fotos/portafolio/${p.id}`,
        }))}
      />
    </AuthShell>
  );
}
