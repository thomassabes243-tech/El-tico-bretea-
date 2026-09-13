"use client";

import Script from "next/script";
import { useState } from "react";
import { CreditCard, LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";

type PaymentMethod = { id: string; name: string; type?: string };

type TilopayInitResult = {
  message?: string;
  test?: number;
  methods?: PaymentMethod[];
};

type TilopaySdk = {
  Init(options: Record<string, unknown>): Promise<TilopayInitResult>;
  startPayment(): Promise<{ message?: string } | void>;
};

declare global {
  interface Window {
    Tilopay?: TilopaySdk;
  }
}

export function TilopayCvCheckout() {
  const [sdkReady, setSdkReady] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodId, setMethodId] = useState("");
  const [phase, setPhase] = useState<"idle" | "starting" | "ready" | "paying">("idle");
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    if (!sdkReady || !window.Tilopay) {
      setError("El formulario de pago todavía está cargando. Intentá de nuevo.");
      return;
    }
    setPhase("starting");
    setError(null);
    try {
      const response = await fetch("/api/cv/tilopay/session", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo iniciar el pago");

      const init = await window.Tilopay.Init(payload.checkout);
      if (init.message && init.message.toLowerCase() !== "success") {
        throw new Error(init.message);
      }
      if (payload.requireTestMode && init.test !== 1) {
        throw new Error("Pago bloqueado: la cuenta de Tilopay no está en modo de pruebas.");
      }
      const availableMethods = init.methods || [];
      if (availableMethods.length === 0) {
        throw new Error("Tilopay no devolvió métodos de pago disponibles.");
      }
      setMethods(availableMethods);
      setMethodId(availableMethods[0].id);
      setPhase("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
      setPhase("idle");
    }
  };

  const pay = async () => {
    if (!window.Tilopay || !methodId) return;
    setPhase("paying");
    setError(null);
    try {
      const result = await window.Tilopay.startPayment();
      if (result?.message) throw new Error(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar el pago");
      setPhase("ready");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Script
        src="https://app.tilopay.com/sdk/v2/sdk_tpay.min.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => setError("No se pudo cargar el formulario seguro de Tilopay.")}
      />

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-colon-600 text-white">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-navy-900">Pago inmediato con tarjeta</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-navy-800/60">
            Pagá dentro de la app y descargá tu CV apenas Tilopay confirme la transacción.
          </p>
        </div>
      </div>

      <div className={phase === "ready" || phase === "paying" ? "flex flex-col gap-3" : "hidden"}>
        <label className="text-xs font-semibold text-navy-900" htmlFor="tlpy_payment_method">
          Método de pago
        </label>
        <select
          id="tlpy_payment_method"
          name="tlpy_payment_method"
          value={methodId}
          onChange={(event) => setMethodId(event.target.value)}
          className="h-11 rounded-xl border border-sand-200 bg-white px-3 text-sm text-navy-900 outline-none focus:border-navy-700"
        >
          {methods.map((method) => (
            <option key={method.id} value={method.id}>{method.name}</option>
          ))}
        </select>
        <select id="tlpy_saved_cards" name="tlpy_saved_cards" className="hidden" defaultValue="">
          <option value="">Nueva tarjeta</option>
        </select>
        <label className="text-xs font-semibold text-navy-900" htmlFor="tlpy_cc_number">Número de tarjeta</label>
        <input
          id="tlpy_cc_number"
          name="tlpy_cc_number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          className="h-11 rounded-xl border border-sand-200 bg-white px-3 text-sm text-navy-900 outline-none focus:border-navy-700"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-navy-900" htmlFor="tlpy_cc_expiration_date">Vencimiento</label>
            <input
              id="tlpy_cc_expiration_date"
              name="tlpy_cc_expiration_date"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              maxLength={5}
              className="h-11 rounded-xl border border-sand-200 bg-white px-3 text-sm text-navy-900 outline-none focus:border-navy-700"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-navy-900" htmlFor="tlpy_cvv">CVV</label>
            <input
              id="tlpy_cvv"
              name="tlpy_cvv"
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              maxLength={4}
              className="h-11 rounded-xl border border-sand-200 bg-white px-3 text-sm text-navy-900 outline-none focus:border-navy-700"
            />
          </div>
        </div>
      </div>

      <div id="responseTilopay" />

      {error && (
        <p role="alert" className="rounded-xl bg-cr-red-100 px-3 py-2 text-xs font-medium text-cr-red-700">
          {error}
        </p>
      )}

      {phase === "ready" || phase === "paying" ? (
        <Button type="button" variant="secondary" fullWidth onClick={pay} disabled={phase === "paying"}>
          {phase === "paying" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
          {phase === "paying" ? "Procesando..." : "Pagar y desbloquear CV"}
        </Button>
      ) : (
        <Button type="button" fullWidth onClick={startCheckout} disabled={!sdkReady || phase === "starting"}>
          {phase === "starting" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          {phase === "starting" ? "Preparando pago..." : sdkReady ? "Pagar con tarjeta" : "Cargando pago seguro..."}
        </Button>
      )}

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-navy-800/50">
        <LockKeyhole className="h-3.5 w-3.5" /> La tarjeta se procesa directamente con Tilopay.
      </p>
    </div>
  );
}
