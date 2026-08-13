import Link from "next/link";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import { ChevronRight } from "lucide-react";

export default function ComunidadPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Comunidad</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Salas de chat por gremio. Publicaciones normales aparecen como
          &ldquo;Publicación comunitaria&rdquo;; vacantes de empresas verificadas, como
          &ldquo;Vacante empresarial verificada ✓&rdquo;.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {COMMUNITY_CATEGORIES.map((cat) => (
            <Link key={cat.value} href={`/comunidad/${cat.value.toLowerCase()}`}>
              <Card className="flex items-center gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CategoryIcon category={cat.value} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-navy-900">{cat.label}</p>
                  <p className="text-xs text-navy-800/50">Aún no hay publicaciones</p>
                </div>
                <ChevronRight className="h-4.5 w-4.5 text-navy-800/30" />
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
