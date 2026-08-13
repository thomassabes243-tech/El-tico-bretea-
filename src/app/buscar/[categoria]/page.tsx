import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Inbox } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { LABOR_CATEGORIES } from "@/lib/constants";

export default async function BuscarCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = LABOR_CATEGORIES.find((c) => c.value.toLowerCase() === categoria);
  if (!category) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Link href="/buscar" className="flex items-center gap-1 text-sm font-medium text-navy-800/60">
          <ChevronLeft className="h-4 w-4" /> Categorías
        </Link>

        <div className="mt-3 flex items-center gap-3">
          <CategoryIcon category={category.value} size="lg" />
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">{category.label}</h1>
        </div>

        <Card className="mt-6 flex flex-col items-center gap-3 p-8 text-center">
          <Inbox className="h-8 w-8 text-navy-800/30" />
          <p className="text-sm font-semibold text-navy-900">
            Todavía no hay vacantes publicadas en esta categoría
          </p>
          <p className="text-xs text-navy-800/50">
            La publicación de vacantes por parte de empresas llega en una próxima entrega.
            Volvé pronto.
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
