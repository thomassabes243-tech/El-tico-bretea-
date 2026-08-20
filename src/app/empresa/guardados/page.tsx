import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { Bookmark, MapPin, Briefcase } from "lucide-react";

export default async function GuardadosPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/registro/empresa");

  const saved = await prisma.savedWorker.findMany({
    where: { companyId: company.id },
    include: { worker: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-navy-700" />
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">
            Mis trabajadores guardados
          </h1>
        </div>
        <p className="mt-1 text-sm text-navy-800/60">
          Perfiles que guardaste para revisar después. Respetamos la privacidad de cada
          trabajador: solo ves lo que él decidió mostrar públicamente.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {saved.length === 0 && (
            <Card className="p-6 text-center text-sm text-navy-800/60">
              Todavía no guardaste ningún perfil.{" "}
              <Link href="/buscar-personal" className="font-semibold text-cr-red-600">
                Buscar personal
              </Link>
            </Card>
          )}
          {saved.map((s) => (
            <Link key={s.id} href={`/trabajadores/${s.worker.id}`}>
              <Card className="flex items-center gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-active">
                <CategoryIcon category={s.worker.laborCategory} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-navy-900">{s.worker.fullName}</p>
                  <p className="truncate text-xs text-navy-800/60">{s.worker.profession}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-navy-800/50">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.worker.residence}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {s.worker.yearsExperience} años</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
