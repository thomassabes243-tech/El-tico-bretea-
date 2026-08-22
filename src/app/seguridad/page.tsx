import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { ShieldAlert, MapPin, ChevronRight } from "lucide-react";
import { TrustedContactsManager } from "@/components/forms/TrustedContactsManager";
import { SafetyActions } from "@/components/forms/SafetyActions";
import { cleanupExpiredLocationShares } from "@/lib/safety";

export default async function SeguridadPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "WORKER") redirect("/perfil");

  await cleanupExpiredLocationShares().catch(() => undefined);

  const contacts = await prisma.trustedContact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Seguridad</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Contactos de confianza, compartir tu ubicación y botón de pánico.
        </p>

        <Card className="mt-4 flex items-start gap-2.5 border-navy-900/10 bg-navy-900/[0.03] p-3.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-navy-800/60" />
          <p className="text-xs leading-relaxed text-navy-800/70">
            Esto es una herramienta de apoyo entre personas, no un servicio de emergencia. Si
            estás en peligro real, llamá primero al <strong>911</strong>.
          </p>
        </Card>

        <div className="mt-5">
          <TrustedContactsManager initialContacts={contacts} />
        </div>

        <div className="mt-5">
          <SafetyActions contacts={contacts} />
        </div>

        <Link href="/puntos-encuentro" className="mt-4 block">
          <Card className="flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-900/[0.07] text-navy-800">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-navy-900">Puntos de encuentro seguros</p>
              <p className="text-xs text-navy-800/50">Lugares públicos para la primera entrevista</p>
            </div>
            <ChevronRight className="h-4.5 w-4.5 text-navy-800/30" />
          </Card>
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}
