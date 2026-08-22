import { MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";

export default async function PuntosEncuentroPage() {
  const points = await prisma.safeMeetingPoint.findMany({
    where: { isActive: true },
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });

  const byCity = new Map<string, typeof points>();
  for (const p of points) {
    byCity.set(p.city, [...(byCity.get(p.city) ?? []), p]);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Puntos de encuentro seguros</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Lugares públicos para proponer como sitio de la primera entrevista, en vez de una
          dirección privada — sobre todo si todavía no conocés a la empresa.
        </p>

        {points.length === 0 && (
          <Card className="mt-5 p-6 text-center text-sm text-navy-800/60">
            Todavía no hay puntos cargados para tu zona.
          </Card>
        )}

        <div className="mt-5 flex flex-col gap-4">
          {Array.from(byCity.entries()).map(([city, cityPoints]) => (
            <div key={city}>
              <h2 className="text-xs font-bold uppercase tracking-wide text-navy-800/40">{city}</h2>
              <div className="mt-2 flex flex-col gap-2">
                {cityPoints.map((p) => (
                  <Card key={p.id} className="flex items-start gap-3 p-3.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-navy-700" />
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{p.name}</p>
                      <p className="text-xs text-navy-800/50">{p.address}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
