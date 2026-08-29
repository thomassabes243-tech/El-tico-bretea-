import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { ServiceRequestForm } from "@/components/forms/ServiceRequestForm";

export default async function NuevaSolicitudPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Necesito un servicio</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Contanos qué necesitás y recibí precio y disponibilidad de profesionales cercanos.
        </p>
        <div className="mt-5">
          <ServiceRequestForm />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
