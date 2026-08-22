"use client";

import { useState } from "react";
import { Flag, CheckCircle2 } from "lucide-react";

export function ReportButton({
  targetUserId,
  targetType,
  isLoggedIn,
  contextLabel,
}: {
  targetUserId: string;
  targetType: "USER" | "COMPANY" | "JOB_POSTING";
  isLoggedIn: boolean;
  /** Se antepone al motivo enviado, ej. el título de la vacante, para que quede claro a qué se refiere el reporte. */
  contextLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isGrave, setIsGrave] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-success-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Reporte enviado. Gracias por ayudarnos a cuidar la comunidad.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-navy-800/40 hover:text-mx-red-600"
      >
        <Flag className="h-3.5 w-3.5" /> Reportar
      </button>
    );
  }

  if (!isLoggedIn) {
    return (
      <p className="text-xs text-navy-800/50">
        <a href="/iniciar-sesion" className="font-semibold text-mx-red-600">Iniciá sesión</a> para reportar.
      </p>
    );
  }

  const submit = async () => {
    if (submitting || reason.trim().length < 5) return;
    setSubmitting(true);
    setError(null);
    try {
      const fullReason = contextLabel ? `[${contextLabel}] ${reason.trim()}` : reason.trim();
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          targetType,
          reason: fullReason,
          severity: isGrave ? "GRAVE" : "NORMAL",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar el reporte");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Contanos brevemente el motivo del reporte"
        className="h-16 w-full resize-none rounded-lg border border-sand-200 px-2.5 py-2 text-xs text-navy-900 placeholder:text-navy-800/35 outline-none focus:border-navy-700"
      />
      <label className="flex items-start gap-1.5 text-xs text-navy-800/60">
        <input
          type="checkbox"
          checked={isGrave}
          onChange={(e) => setIsGrave(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 rounded border-sand-200 text-mx-red-600"
        />
        Es un caso grave de seguridad (acoso, identidad o ubicación falsa, riesgo físico)
      </label>
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={submitting || reason.trim().length < 5}
          className="rounded-lg bg-mx-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar reporte"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-navy-800/50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
