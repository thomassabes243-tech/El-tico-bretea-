"use client";

import { getSalarySemaforo } from "@/lib/salary-guide";

// Semáforo de seguridad: compara el salario ofrecido (texto libre) contra la
// guía de rangos típicos por categoría -- todo calculado en el navegador a
// partir de datos ya cacheados (ver src/lib/salary-guide.ts), sin pedirle
// nada al servidor por cada oferta que aparece en una lista.
export function SalarySemaforo({
  category,
  salaryText,
  compact = false,
}: {
  category: string;
  salaryText: string | null;
  compact?: boolean;
}) {
  const result = getSalarySemaforo(category, salaryText);
  if (!result) return null;

  const dotColor =
    result.level === "verde"
      ? "bg-success-600"
      : result.level === "amarillo"
        ? "bg-warning-600"
        : "bg-mx-red-600";

  if (compact) {
    return (
      <span
        className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
        title={result.message}
        aria-label={result.message}
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-800/60">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} aria-hidden />
      {result.message}
    </span>
  );
}
