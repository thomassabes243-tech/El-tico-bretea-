"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

// Confirmación de llegada segura sobre un compartir-ubicación ya creado
// (SafetyActions / GoingToInterviewButton) -- gratis para cualquiera, nunca
// detrás de Premium. No dispara ninguna notificación push/SMS al contacto
// (TrustedContact no es una cuenta de la app) -- lo que hace es marcar el
// mismo link de solo lectura que el contacto ya tiene, para que lo vea
// reflejado si lo recarga.
export function ArrivedSafelyButton({ shareId }: { shareId: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (busy || done) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ubicacion/${shareId}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmedSafe: true }),
      });
      if (!res.ok) throw new Error("No se pudo confirmar la llegada");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <p className="flex items-center gap-1.5 text-xs font-semibold text-success-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Marcado como &quot;llegué segura&quot; -- tu contacto lo ve en el mismo link.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={confirm}
        disabled={busy}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-success-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> {busy ? "Confirmando..." : "Llegué segura"}
      </button>
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}
