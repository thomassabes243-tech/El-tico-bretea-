import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

// Sistema único de badges/chips para toda la app -- mismo radio, padding y
// tipografía en todos lados; solo cambia el tono según lo que representa
// (verificado, premium, urgente, estado neutro, etc).
type Tone = "neutral" | "navy" | "red" | "success" | "warning" | "premium";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-sand-100 text-navy-800/70",
  navy: "bg-navy-900/[0.08] text-navy-800",
  red: "bg-cr-red-600/10 text-cr-red-700",
  success: "bg-success-600/10 text-success-600",
  warning: "bg-warning-600/10 text-warning-600",
  premium: "bg-colon-100 text-colon-700",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
};

export function Badge({ tone = "neutral", icon, children, className, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}

// Variante para pastillas informativas (ubicación, tipo de contrato, etc.)
// que no son estados/badges destacados -- texto normal, no mayúsculas.
export function TagChip({ icon, children, className, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-medium text-navy-800/70",
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
