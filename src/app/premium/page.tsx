import { redirect } from "next/navigation";
import { Sparkles, EyeOff, TrendingUp, BarChart3, FileText, ImagePlus, BadgeCheck, Info } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { SubscribeButton } from "@/components/forms/SubscribeButton";
import { CancelSubscriptionButton } from "@/components/forms/CancelSubscriptionButton";
import { getAppSettings } from "@/lib/settings";
import { formatPesos } from "@/lib/format";

// Reactivado: cobro real vía PayPal (suscripción mensual). Ninguna función
// de seguridad depende de esto ni depende nunca de él -- son beneficios no
// esenciales (visibilidad, sin publicidad, herramientas de CV).
const PREMIUM_ENABLED = true;

const BENEFITS = [
  { icon: EyeOff, text: "Sin publicidad" },
  { icon: TrendingUp, text: "Mayor visibilidad de tu perfil" },
  { icon: BadgeCheck, text: "Perfil destacado e insignia Premium" },
  { icon: BarChart3, text: "Prioridad en recomendaciones y estadísticas" },
  { icon: FileText, text: "Herramientas adicionales para tu CV" },
  { icon: ImagePlus, text: "Sin límite diario de fotos en el chat" },
];

export default async function PremiumPage() {
  if (!PREMIUM_ENABLED) redirect("/");

  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "WORKER") redirect("/perfil");

  const [settings, worker] = await Promise.all([
    getAppSettings(),
    prisma.workerProfile.findUnique({ where: { userId: session.user.id } }),
  ]);
  const price = formatPesos(settings.premiumPricePesos);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-peso-600" />
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">El Mexa Chamba Premium</h1>
        </div>

        <Card className="mt-5 overflow-hidden border-peso-600/20">
          <div className="bg-gradient-to-br from-peso-700 to-peso-600 px-6 py-7 text-white">
            <p className="text-sm font-medium text-white/80">Suscripción mensual</p>
            <div className="mt-1 flex items-end gap-1">
              <span className="text-4xl font-extrabold">${price}</span>
              <span className="mb-1 text-sm text-white/70">/ mes</span>
            </div>
          </div>
          <div className="p-5">
            <ul className="flex flex-col gap-3">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.text} className="flex items-center gap-3 text-sm text-navy-800/80">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-peso-100 text-peso-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    {b.text}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6">
              {worker?.isPremium ? (
                <CancelSubscriptionButton cancelUrl="/api/paypal/premium/cancelar" label="Cancelar Premium" />
              ) : settings.paypalPremiumPlanId ? (
                <SubscribeButton
                  planId={settings.paypalPremiumPlanId}
                  confirmUrl="/api/paypal/premium/confirmar"
                  containerId="paypal-premium-buttons"
                />
              ) : (
                <p className="rounded-lg bg-sand-100 px-3 py-2.5 text-center text-xs text-navy-800/50">
                  Activar Premium — próximamente
                </p>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-navy-800/45">
              El monto se cobra en pesos vía PayPal. Podés cancelar cuando quieras.
            </p>
          </div>
        </Card>

        <Card className="mt-4 flex gap-2.5 border-navy-700/15 bg-navy-900/[0.03] p-4">
          <Info className="h-4 w-4 shrink-0 text-navy-700" />
          <p className="text-xs leading-relaxed text-navy-800/70">
            Premium nunca garantiza empleo, y ninguna función de seguridad (SOS, contactos de
            confianza, ubicación compartida) depende de esto — esas quedan gratis siempre. Ver{" "}
            <a href="/acerca-de" className="font-semibold text-mx-red-600">Acerca de</a> para más
            detalle sobre por qué cobramos.
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
