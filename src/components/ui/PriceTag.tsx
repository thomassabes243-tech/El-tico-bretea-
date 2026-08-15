import clsx from "clsx";

/**
 * Insignia de precio con el símbolo del peso ($). El acento morado se
 * inspira en la paleta del billete de $500 MXN sin reproducirlo — se usa
 * únicamente en contextos de pago (Premium, CV, donaciones).
 */
export function PriceTag({
  amount,
  suffix,
  size = "md",
  className,
}: {
  amount: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-lg px-3.5 py-1.5 gap-2",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-peso-100 font-bold text-peso-700",
        sizeClasses[size],
        className
      )}
    >
      <span className="font-extrabold text-peso-600">$</span>
      {amount}
      {suffix && <span className="font-medium text-peso-600/70">{suffix}</span>}
    </span>
  );
}
