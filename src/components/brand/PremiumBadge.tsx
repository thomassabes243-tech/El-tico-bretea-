import { Sparkles } from "lucide-react";
import clsx from "clsx";

// Insignia visual para perfiles pagos (Premium de trabajador, "Destacado"
// del Plan Profesional de Cotizaciones) -- mismo look en toda la app para
// que se reconozca de un vistazo, con la palabra que corresponda a cada
// plan. Nunca decide nada por sí sola (ni orden ni acceso), solo hace
// visible un estado que ya existía en la base.
export function PremiumBadge({
  label = "Premium",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-peso-700 to-peso-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
        className
      )}
    >
      <Sparkles className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}
