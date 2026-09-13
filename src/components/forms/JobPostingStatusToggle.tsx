"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function JobPostingStatusToggle({ jobId, isActive }: { jobId: string; isActive: boolean }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchStatus = async (body: { isActive: boolean; closureReason?: string | null }) => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/vacantes/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el estado de la vacante");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isActive) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => patchStatus({ isActive: true })}
          disabled={isSubmitting}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-success-600/30 px-2.5 py-1.5 text-xs font-semibold text-success-600"
        >
          <Eye className="h-3.5 w-3.5" /> Reactivar
        </button>
        {error && <p className="text-[11px] font-medium text-mx-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => {
          if (!window.confirm("¿Quitar esta vacante de las búsquedas? Conservarás los aplicantes y podrás reactivarla.")) return;
          patchStatus({ isActive: false, closureReason: "PUESTO_LLENO" });
        }}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-mx-red-600/25 px-2.5 py-1.5 text-xs font-semibold text-mx-red-700"
      >
        <EyeOff className="h-3.5 w-3.5" /> Ya contraté · quitar
      </button>
      {error && <p className="text-[11px] font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}
