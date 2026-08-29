"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptQuoteButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    if (submitting) return;
    if (!confirm("¿Confirmás que contratás a este profesional? Se cierran las demás cotizaciones.")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/servicios/cotizaciones/${quoteId}/aceptar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo confirmar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={accept}
        disabled={submitting}
        className="rounded-lg bg-mx-red-600 px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "Confirmando..." : "Contratar"}
      </button>
      {error && <p className="text-[11px] font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}
