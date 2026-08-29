"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export function RateQuoteForm({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (submitting || rating < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/servicios/cotizaciones/${quoteId}/calificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar la calificación");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-sand-200 p-3">
      <p className="text-xs font-semibold text-navy-900">¿Cómo te fue con este profesional?</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <Star
              className={`h-6 w-6 ${n <= rating ? "fill-warning-600 text-warning-600" : "text-sand-200"}`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Contanos cómo te fue (opcional)"
        className="h-16 w-full resize-none rounded-lg border border-sand-200 px-2.5 py-2 text-xs text-navy-900 placeholder:text-navy-800/35 outline-none focus:border-navy-700"
      />
      {error && <p className="text-[11px] font-medium text-mx-red-600">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={submitting || rating < 1}
        className="rounded-lg bg-mx-red-600 px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "Enviando..." : "Enviar calificación"}
      </button>
    </div>
  );
}
