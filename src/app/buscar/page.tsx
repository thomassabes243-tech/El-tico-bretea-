import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { HeroImage } from "@/components/brand/HeroImage";
import { SmartSearchBar } from "@/components/forms/SmartSearchBar";
import { LABOR_CATEGORIES, CATEGORY_PHOTOS } from "@/lib/constants";
import { ShieldCheck } from "lucide-react";

export default function BuscarPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        <section className="relative min-h-[238px] overflow-hidden rounded-[28px] bg-navy-950 px-6 py-7 text-white shadow-[0_20px_44px_rgba(6,27,51,0.22)]">
          <HeroImage src="/assets/images/quiero-trabajar.jpg" alt="" fallbackClassName="bg-navy-950" className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.44]" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/82 to-navy-950/25" />
          <div className="relative flex min-h-[182px] max-w-[78%] flex-col justify-end">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">Oportunidades en México</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-[1.05] tracking-[-0.04em]">Encontrá una chamba para vos</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/72">Buscá por oficio, empresa o ubicación y revisá cada oferta antes de aplicar.</p>
          </div>
        </section>

        <div className="relative z-10 -mt-4 mx-3 rounded-2xl bg-white p-1 shadow-[0_12px_30px_rgba(10,38,71,0.15)]">
          <SmartSearchBar />
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-[20px] border border-mx-green-600/15 bg-mx-green-600/[0.06] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mx-green-600/10 text-mx-green-600">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-bold text-navy-900">Aplicá con precaución</p>
            <p className="mt-0.5 text-xs leading-relaxed text-navy-800/55">Nunca pagués por una entrevista o vacante. Confirmá siempre la empresa y el lugar.</p>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-mx-red-600">Explorá</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-navy-900">Categorías de trabajo</h2>
          </div>
          <span className="text-xs font-semibold text-navy-800/45">Elegí una</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {LABOR_CATEGORIES.map((cat) => {
            const photo = CATEGORY_PHOTOS[cat.value];
            return (
              <Link key={cat.value} href={`/buscar/${cat.value.toLowerCase()}`}>
                <Card className="relative flex h-40 flex-col items-start justify-end gap-1.5 overflow-hidden border-0 p-4 shadow-[0_12px_26px_rgba(10,38,71,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  {photo ? (
                    <>
                      <Image
                        src={photo}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 220px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                      <div className="relative flex flex-col items-start gap-1.5">
                        <CategoryIcon category={cat.value} size="sm" />
                        <span className="text-sm font-semibold text-white">{cat.label}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-start gap-1.5">
                      <CategoryIcon category={cat.value} size="sm" />
                      <span className="text-sm font-semibold text-navy-900">{cat.label}</span>
                    </div>
                  )}
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
