import { AlertTriangle } from "lucide-react";

/** Se muestra siempre que payment-scam-detector encuentre alguna coincidencia -- a diferencia de AnalyzeJobButton (IA, bajo demanda), esto es gratis, instantáneo y siempre visible. */
export function PaymentWarningBanner({ matches }: { matches: string[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-mx-red-600/25 bg-mx-red-600/[0.06] p-3.5">
      <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-mx-red-600" />
      <div>
        <p className="text-sm font-bold text-mx-red-600">Ojo: esta oferta menciona algo que las ofertas reales casi nunca piden</p>
        <p className="mt-1 text-xs leading-relaxed text-navy-800/70">
          Encontramos texto sobre: <strong>{matches.join(", ")}</strong>. Ninguna empresa real te va a
          pedir plata para empezar a trabajar. Si te lo piden, es casi siempre una estafa.
        </p>
      </div>
    </div>
  );
}
