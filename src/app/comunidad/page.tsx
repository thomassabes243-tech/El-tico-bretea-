import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { COMMUNITY_CATEGORIES, CATEGORY_PHOTOS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getAdEligibility, getActiveAds } from "@/lib/ads";
import { AdSlot } from "@/components/ads/AdSlot";
import { CommunityInviteBanner } from "@/components/community/CommunityInviteBanner";
import { ChevronRight } from "lucide-react";
import type { CommunityCategory } from "@prisma/client";

export default async function ComunidadPage() {
  const [rooms, adEligible, ads] = await Promise.all([
    prisma.chatRoom.findMany({ include: { _count: { select: { messages: true } } } }),
    getAdEligibility(),
    getActiveAds(),
  ]);
  const countByCategory = new Map(rooms.map((r) => [r.category, r._count.messages]));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Comunidad Tica</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-navy-800/60">
          Chat en vivo para todos los ticos. Publicaciones normales aparecen como
          &ldquo;Publicación comunitaria&rdquo;; vacantes de empresas verificadas, como
          &ldquo;Vacante empresarial verificada ✓&rdquo;.
        </p>

        <CommunityInviteBanner />

        <div className="mt-6 flex flex-col gap-3">
          {COMMUNITY_CATEGORIES.map((cat) => {
            const count = countByCategory.get(cat.value as CommunityCategory) ?? 0;
            const photo = CATEGORY_PHOTOS[cat.value];
            return (
              <Link key={cat.value} href={`/comunidad/${cat.value.toLowerCase()}`}>
                <Card className="relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-active">
                  {photo && (
                    <>
                      <Image src={photo} alt="" fill sizes="512px" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/55 to-navy-950/10" />
                    </>
                  )}
                  <div className="relative flex items-center gap-3.5 p-4">
                    <CategoryIcon category={cat.value} size="md" />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${photo ? "text-white" : "text-navy-900"}`}>{cat.label}</p>
                      <p className={`text-xs ${photo ? "text-white/70" : "text-navy-800/50"}`}>
                        {count === 0 ? "Aún no hay publicaciones" : `${count} publicaciones`}
                      </p>
                    </div>
                    <ChevronRight className={`h-4.5 w-4.5 ${photo ? "text-white/50" : "text-navy-800/30"}`} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <AdSlot eligible={adEligible} ads={ads} />
      </main>
      <BottomNav />
    </div>
  );
}
