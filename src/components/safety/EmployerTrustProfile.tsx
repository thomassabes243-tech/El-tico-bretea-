import { CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { EmployerTrustProfile as TrustProfile } from "@/lib/employer-trust";

const LEVEL_META: Record<
  TrustProfile["level"],
  { label: string; icon: typeof ShieldCheck; badgeClass: string }
> = {
  VERDE: { label: "Sin señales de riesgo detectadas", icon: ShieldCheck, badgeClass: "bg-success-600/10 text-success-600" },
  AMARILLO: { label: "Revisá antes de avanzar", icon: ShieldQuestion, badgeClass: "bg-warning-600/10 text-warning-600" },
  ROJO: { label: "Señales de riesgo importantes", icon: ShieldAlert, badgeClass: "bg-mx-red-600/10 text-mx-red-600" },
};

/** Perfil de confianza a partir de señales objetivas ya existentes -- nunca una verificación de identidad real. */
export function EmployerTrustProfile({ profile }: { profile: TrustProfile }) {
  const meta = LEVEL_META[profile.level];
  const Icon = meta.icon;

  return (
    <Card className="p-4">
      <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold ${meta.badgeClass}`}>
        <Icon className="h-4 w-4 shrink-0" /> {meta.label}
      </div>

      {profile.signals.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {profile.signals.map((s) => (
            <li key={s.label} className="flex items-start gap-1.5 text-xs text-navy-800/70">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-600" /> {s.label}
            </li>
          ))}
        </ul>
      )}

      {profile.risks.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5 border-t border-sand-200 pt-2">
          {profile.risks.map((r) => (
            <li key={r.label} className="flex items-start gap-1.5 text-xs text-navy-800/70">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning-600" /> {r.label}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-navy-800/40">
        Basado en datos objetivos (verificación, antigüedad, reportes) -- no es una verificación de identidad ni una garantía.
      </p>
    </Card>
  );
}
