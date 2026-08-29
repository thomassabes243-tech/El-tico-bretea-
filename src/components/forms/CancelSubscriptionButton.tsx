"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelSubscriptionButton({
  cancelUrl,
  label,
}: {
  cancelUrl: string;
  label: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = async () => {
    if (submitting) return;
    if (!confirm("¿Confirmás que querés cancelar la suscripción?")) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(cancelUrl, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cancelar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="rounded-lg bg-success-600/10 px-3 py-2.5 text-center text-xs font-semibold text-success-600">
        Ya está activo
      </p>
      <button
        type="button"
        onClick={cancel}
        disabled={submitting}
        className="text-center text-xs font-medium text-navy-800/50 underline disabled:opacity-50"
      >
        {submitting ? "Cancelando..." : label}
      </button>
      {error && <p className="text-center text-xs font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}
