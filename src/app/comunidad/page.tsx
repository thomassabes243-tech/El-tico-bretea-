import Link from "next/link";
import type { ComponentType } from "react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { GuanacasteScene } from "@/components/brand/scenery/GuanacasteScene";
import { MonteverdeScene } from "@/components/brand/scenery/MonteverdeScene";
import { CoffeeMountainsScene } from "@/components/brand/scenery/CoffeeMountainsScene";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ChevronRight } from "lucide-react";
import type { CommunityCategory } from "@prisma/client";

const COMMUNITY_SCENES: Record<string, ComponentType<{ className?: string }>> = {
  CONSTRUCCION: CoffeeMountainsScene,
  HOTELES_TURISMO: GuanacasteScene,
  PROFESIONALES: MonteverdeScene,
};

export default async function ComunidadPage() {
  const rooms = await prisma.chatRoom.findMany({
    include: { _count: { select: { messages: true } } },
  });
  const countByCategory = new Map(rooms.map((r) => [r.category, r._count.messages]));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Comunidad</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Salas de chat por gremio, en vivo. Publicaciones normales aparecen como
          &ldquo;Publicación comunitaria&rdquo;; vacantes de empresas verificadas, como
          &ldquo;Vacante empresarial verificada ✓&rdquo;.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {COMMUNITY_CATEGORIES.map((cat) => {
            const count = countByCategory.get(cat.value as CommunityCategory) ?? 0;
            const Scene = COMMUNITY_SCENES[cat.value];
            return (
              <Link key={cat.value} href={`/comunidad/${cat.value.toLowerCase()}`}>
                <Card className="relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
                  {Scene && (
                    <>
                      <Scene className="absolute inset-0 h-full w-full" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40" />
                    </>
                  )}
                  <div className="relative flex items-center gap-3.5 p-4">
                    <CategoryIcon category={cat.value} size="md" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-navy-900">{cat.label}</p>
                      <p className="text-xs text-navy-800/50">
                        {count === 0 ? "Aún no hay publicaciones" : `${count} publicaciones`}
                      </p>
                    </div>
                    <ChevronRight className="h-4.5 w-4.5 text-navy-800/30" />
                  </div>
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
