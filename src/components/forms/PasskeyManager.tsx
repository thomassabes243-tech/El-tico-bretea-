"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PasskeyManager() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function registerPasskey() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const optionsResponse = await fetch("/api/auth/passkey/registro/opciones", { method: "POST" });
      const options = await optionsResponse.json().catch(() => ({}));
      if (!optionsResponse.ok) throw new Error(options.error || "No se pudo iniciar la configuración");

      const registration = await startRegistration(options);
      const verifyResponse = await fetch("/api/auth/passkey/registro/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration),
      });
      const result = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) throw new Error(result.error || "No se pudo guardar este celular");
      setMessage("Listo. La próxima vez podés entrar con este celular.");
    } catch (caught) {
      if (caught instanceof Error && caught.name === "NotAllowedError") {
        setError("Se canceló la verificación del celular.");
      } else {
        setError(caught instanceof Error ? caught.message : "No se pudo activar la entrada rápida");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <Button type="button" fullWidth variant="outline" onClick={registerPasskey} disabled={busy}>
        <Smartphone className="h-4 w-4" />
        {busy ? "Verificando…" : "Activar entrada con este celular"}
      </Button>
      {message && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-mx-green-600/[0.08] px-3 py-2.5 text-xs font-medium text-mx-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {message}
        </p>
      )}
      {error && <p className="mt-3 rounded-xl bg-mx-red-100 px-3 py-2.5 text-xs font-medium text-mx-red-700">{error}</p>}
    </div>
  );
}
