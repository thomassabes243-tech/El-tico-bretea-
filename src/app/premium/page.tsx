import { Sparkles, EyeOff, TrendingUp, BarChart3, FileText, ImagePlus, BadgeCheck, Info } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";

const BENEFITS = [
  { icon: EyeOff, text: "Sin publicidad" },
  { icon: TrendingUp, text: "Mayor visibilidad de tu perfil" },
  { icon: BadgeCheck, text: "Perfil destacado e insignia Premium" },
  { icon: BarChart3, text: "Prioridad en recomendaciones y estadísticas" },
  { icon: FileText, text: "Herramientas adicionales para tu CV" },
  { icon: ImagePlus, text: "Sin límite diario de fotos en el chat" },
];

export default function PremiumPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-colon-600" />
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">El Tico Bretea Premium</h1>
        </div>

        <Card className="mt-5 overflow-hidden border-colon-600/20">
          <div className="bg-gradient-to-br from-colon-700 to-colon-600 px-6 py-7 text-white">
            <p className="text-sm font-medium text-white/80">Suscripción mensual</p>
            <div className="mt-1 flex items-end gap-1">
              <span className="text-4xl font-extrabold">₡1,500</span>
              <span className="mb-1 text-sm text-white/70">/ mes</span>
            </div>
          </div>
          <div className="p-5">
            <ul className="flex flex-col gap-3">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.text} className="flex items-center gap-3 text-sm text-navy-800/80">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-colon-100 text-colon-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    {b.text}
                  </li>
                );
              })}
            </ul>

            <Button fullWidth className="mt-6" disabled variant="secondary">
              Activar Premium — próximamente
            </Button>
            <p className="mt-2 text-center text-xs text-navy-800/45">
              El monto puede variar; se cobra en colones con tarjeta.
            </p>
          </div>
        </Card>

        <Card className="mt-4 flex gap-2.5 border-navy-700/15 bg-navy-900/[0.03] p-4">
          <Info className="h-4 w-4 shrink-0 text-navy-700" />
          <p className="text-xs leading-relaxed text-navy-800/70">
            Premium nunca garantiza empleo. El pago está en desarrollo, a la espera de definir
            un procesador de pagos compatible con Costa Rica — ver{" "}
            <a href="/acerca-de" className="font-semibold text-cr-red-600">Acerca de</a> para más
            detalle sobre por qué cobramos.
          </p>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-navy-800/45">
          <PriceTag amount="1,500" suffix="/ mes" />
          <span>· precio configurable desde el panel administrativo</span>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
