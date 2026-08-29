"use client";

import { useEffect, useRef, useState } from "react";
import { HeartHandshake } from "lucide-react";

const SUGGESTED_AMOUNTS = [20, 50, 100];
const SDK_SRC_PREFIX = "https://www.paypal.com/sdk/js";

function loadPaypalSdk(clientId: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${SDK_SRC_PREFIX}?client-id=${clientId}&currency=MXN&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPal"));
    document.body.appendChild(script);
  });
}

export function DonationForm() {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    loadPaypalSdk(clientId)
      .then(() => setSdkReady(true))
      .catch(() => setError("No se pudo cargar PayPal. Revisá tu conexión e intentá de nuevo."));
  }, [clientId]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !buttonsContainerRef.current || done) return;
    buttonsContainerRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: { layout: "horizontal", color: "gold", label: "donate", height: 45 },
      createOrder: async () => {
        setError(null);
        const res = await fetch("/api/paypal/donaciones/crear-orden", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountPesos: amount }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago");
        return data.orderId;
      },
      onApprove: async (data) => {
        const res = await fetch("/api/paypal/donaciones/capturar-orden", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "No se pudo confirmar el pago");
          return;
        }
        setDone(true);
      },
      onError: () => setError("Ocurrió un error con PayPal. Intentá de nuevo en un momento."),
    }).render("#paypal-donar-buttons");
  }, [sdkReady, amount, done]);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <HeartHandshake className="h-8 w-8 text-mx-red-600" />
        <p className="text-sm font-bold text-navy-900">¡Gracias por tu donación de ${amount} MXN!</p>
        <p className="text-xs text-navy-800/60">De verdad ayuda a mantener la app funcionando.</p>
      </div>
    );
  }

  if (!clientId) {
    return (
      <p className="text-xs text-navy-800/50">
        Los pagos todavía no están configurados en este entorno.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTED_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => {
              setAmount(a);
              setCustomAmount("");
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              amount === a && !customAmount
                ? "border-mx-red-600 bg-mx-red-600 text-white"
                : "border-sand-200 text-navy-800/70"
            }`}
          >
            ${a}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-navy-800/60">$</span>
        <input
          type="number"
          min={10}
          max={50000}
          placeholder="Otro monto"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            const parsed = Math.round(Number(e.target.value));
            if (Number.isFinite(parsed) && parsed >= 10 && parsed <= 50000) setAmount(parsed);
          }}
          className="h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
        />
        <span className="text-sm font-medium text-navy-800/50">MXN</span>
      </div>

      {error ? (
        <p className="text-xs font-medium text-mx-red-600">{error}</p>
      ) : !sdkReady ? (
        <p className="text-center text-xs text-navy-800/40">Cargando PayPal...</p>
      ) : (
        <div id="paypal-donar-buttons" ref={buttonsContainerRef} />
      )}
    </div>
  );
}
