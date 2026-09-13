"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function ServiceRequestStatusToggle({ requestId, status }: { requestId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "CERRADA") return null;
  const isOpen = status === "ABIERTA";

  async function toggle() {
    if (busy) return;
    if (isOpen && !window.confirm("¿Quitar esta solicitud? Dejará de recibir cotizaciones, pero conservarás el historial.")) return;

    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/servicios/solicitudes/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isOpen ? "CANCELADA" : "ABIERTA" }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "No se pudo cambiar la solicitud");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cambiar la solicitud");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={isOpen
          ? "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-mx-red-600/20 bg-white text-sm font-bold text-mx-red-700"
          : "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-mx-green-600 text-sm font-bold text-white"}
      >
        {isOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {busy ? "Guardando…" : isOpen ? "Ya resolví esto · quitar publicación" : "Volver a publicar solicitud"}
      </button>
      {error && <p className="mt-2 text-center text-xs font-semibold text-mx-red-600">{error}</p>}
    </div>
  );
}

