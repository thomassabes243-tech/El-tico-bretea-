"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Flag, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ScamAlertActions({
  alertId,
  isLoggedIn,
  isAuthor,
  initialConfirmed,
  initialCount,
  canModerate,
  status,
}: {
  alertId: string;
  isLoggedIn: boolean;
  isAuthor: boolean;
  initialConfirmed: boolean;
  initialCount: number;
  canModerate: boolean;
  status: string;
}) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagSent, setFlagSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleConfirm = async () => {
    if (pending || !isLoggedIn || isAuthor) return;
    setPending(true);
    setError(null);
    const next = !confirmed;
    try {
      const res = await fetch(`/api/alertas-estafa/${alertId}/confirmar`, {
        method: next ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error();
      setConfirmed(next);
      setCount((c) => c + (next ? 1 : -1));
    } catch {
      setError("No se pudo actualizar tu confirmación");
    } finally {
      setPending(false);
    }
  };

  const sendFlag = async () => {
    if (pending || flagReason.trim().length < 5) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/alertas-estafa/${alertId}/reportar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: flagReason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar el reporte");
      }
      setFlagSent(true);
      setShowFlagForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el reporte");
    } finally {
      setPending(false);
    }
  };

  const moderate = async (nextStatus: "VERIFICADO" | "DESCARTADO") => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/alertas-estafa/${alertId}/moderar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("No se pudo actualizar el estado");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={toggleConfirm}
          disabled={pending || !isLoggedIn || isAuthor}
          title={isAuthor ? "No podés confirmar tu propia alerta" : undefined}
          className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold disabled:opacity-50 ${
            confirmed ? "border-navy-900 bg-navy-900 text-white" : "border-sand-200 text-navy-800/70"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {confirmed ? "Confirmado por vos" : "Confirmar (a mí también me pasó)"}
          {count > 0 && <span className="opacity-70">· {count}</span>}
        </button>

        {isLoggedIn && !flagSent && (
          <button
            onClick={() => setShowFlagForm((v) => !v)}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg border border-sand-200 px-3.5 py-2 text-xs font-semibold text-navy-800/60 disabled:opacity-50"
          >
            <Flag className="h-3.5 w-3.5" /> Reportar como falso
          </button>
        )}
        {flagSent && (
          <span className="text-xs font-medium text-navy-800/50">Gracias, lo enviamos a moderación.</span>
        )}
      </div>

      {!isLoggedIn && (
        <p className="text-xs text-navy-800/45">Iniciá sesión para confirmar o reportar esta alerta.</p>
      )}

      {showFlagForm && (
        <div className="flex flex-col gap-2 rounded-xl border border-sand-200 p-3">
          <textarea
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            placeholder="¿Por qué creés que es falso o malicioso?"
            className="h-20 w-full resize-none rounded-lg border border-sand-200 px-3 py-2 text-xs outline-none focus:border-navy-700"
          />
          <Button size="sm" variant="outline" disabled={pending || flagReason.trim().length < 5} onClick={sendFlag}>
            Enviar reporte
          </Button>
        </div>
      )}

      {canModerate && (
        <div className="flex flex-wrap items-center gap-2 border-t border-sand-200 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-navy-800/40">Moderación</span>
          <button
            onClick={() => moderate("VERIFICADO")}
            disabled={pending || status === "VERIFICADO"}
            className="flex items-center gap-1 rounded-lg bg-success-600/10 px-3 py-1.5 text-xs font-semibold text-success-600 disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Verificar
          </button>
          <button
            onClick={() => moderate("DESCARTADO")}
            disabled={pending || status === "DESCARTADO"}
            className="flex items-center gap-1 rounded-lg bg-navy-800/10 px-3 py-1.5 text-xs font-semibold text-navy-800/60 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" /> Descartar
          </button>
        </div>
      )}

      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}
