"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmText.trim().toUpperCase() === "ELIMINAR";

  const deleteAccount = async () => {
    if (!canConfirm || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/cuenta", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "ELIMINAR" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo eliminar la cuenta");
      }
      await signOut({ callbackUrl: "/?cuenta-eliminada=1" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
      setPending(false);
    }
  };

  return (
    <Card className="mt-4 p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold text-mx-red-600">
        <Trash2 className="h-4 w-4" /> Eliminar mi cuenta
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-navy-800/60">
        Borra tu cuenta, tu perfil y tus datos asociados de forma permanente. Esta acción no
        se puede deshacer.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 rounded-lg border border-mx-red-600/30 px-3 py-1.5 text-xs font-semibold text-mx-red-600"
        >
          Quiero eliminar mi cuenta
        </button>
      ) : (
        <div className="mt-3 rounded-xl border border-mx-red-600/20 bg-mx-red-100/30 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-mx-red-600" />
              <p className="text-xs leading-relaxed text-navy-800/75">
                Esto elimina tu cuenta, perfil, vacantes o aplicaciones, mensajes y archivos
                asociados. Para confirmar, escribí <strong>ELIMINAR</strong> abajo.
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="shrink-0 text-navy-800/40">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR"
            className="mt-3 h-10 w-full rounded-lg border border-sand-200 bg-white px-3 text-sm text-navy-900 outline-none focus:border-mx-red-600"
          />
          {error && <p className="mt-2 text-xs font-medium text-mx-red-700">{error}</p>}
          <button
            onClick={deleteAccount}
            disabled={!canConfirm || pending}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-mx-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {pending ? "Eliminando..." : "Eliminar definitivamente"}
          </button>
        </div>
      )}
    </Card>
  );
}
