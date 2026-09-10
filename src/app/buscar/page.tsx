import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { LABOR_CATEGORIES, CATEGORY_PHOTOS } from "@/lib/constants";

export default function BuscarPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 px-5 py-6 text-white shadow-[0_18px_40px_rgba(6,27,51,0.20)]">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-mx-red-600/25 blur-2xl" />
          <p className="relative text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Oportunidades en México</p>
          <h1 className="relative mt-2 text-[27px] font-extrabold tracking-[-0.035em]">Buscar trabajo</h1>
          <p className="relative mt-1.5 max-w-[85%] text-sm leading-relaxed text-white/70">Elegí tu oficio y encontrá vacantes disponibles cerca de vos.</p>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3">
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
