import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Tone = "neutral" | "navy" | "red" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-sand-100 text-navy-800/70",
  navy: "bg-navy-900/[0.08] text-navy-800",
  red: "bg-mx-red-600/10 text-mx-red-700",
  success: "bg-success-600/10 text-success-600",
  warning: "bg-warning-600/10 text-warning-600",
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
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
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
