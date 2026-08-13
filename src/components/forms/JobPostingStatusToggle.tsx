"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function JobPostingStatusToggle({ jobId, isActive }: { jobId: string; isActive: boolean }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/vacantes/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el estado de la vacante");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={isSubmitting}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
          isActive ? "border-sand-200 text-navy-800/70" : "border-success-600/30 text-success-600"
        }`}
      >
        {isActive ? (
          <>
            <EyeOff className="h-3.5 w-3.5" /> Cerrar vacante
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5" /> Reactivar
          </>
        )}
      </button>
      {error && <p className="text-[11px] font-medium text-cr-red-600">{error}</p>}
    </div>
  );
}
