import Link from "next/link";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { LABOR_CATEGORIES } from "@/lib/constants";

export default function BuscarPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Buscar trabajo</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Elegí una categoría para ver las vacantes disponibles.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {LABOR_CATEGORIES.map((cat) => (
            <Link key={cat.value} href={`/buscar/${cat.value.toLowerCase()}`}>
              <Card className="flex flex-col items-start gap-2.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CategoryIcon category={cat.value} size="md" />
                <span className="text-sm font-semibold text-navy-900">{cat.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
