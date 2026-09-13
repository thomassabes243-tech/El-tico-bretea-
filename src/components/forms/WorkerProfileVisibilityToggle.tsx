"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function WorkerProfileVisibilityToggle({ isPublic }: { isPublic: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (busy) return;
    if (isPublic && !window.confirm("¿Quitar tu perfil de las búsquedas de empresas? Podrás volver a publicarlo cuando quieras.")) return;

    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/perfil/trabajador", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "No se pudo cambiar la publicación");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cambiar la publicación");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={isPublic
          ? "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-mx-red-600/20 bg-mx-red-100/35 text-sm font-bold text-mx-red-700"
          : "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-mx-green-600 text-sm font-bold text-white"}
      >
        {isPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {busy ? "Guardando…" : isPublic ? "Ya encontré trabajo · quitar publicación" : "Volver a publicar mi perfil"}
      </button>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-navy-800/50">
        {isPublic
          ? "Tu perfil aparece en Buscar personal. Al quitarlo conservás tu cuenta, CV y solicitudes."
          : "Tu perfil está guardado, pero ninguna empresa puede encontrarlo en las búsquedas."}
      </p>
      {error && <p className="mt-2 text-center text-xs font-semibold text-mx-red-600">{error}</p>}
    </div>
  );
}

