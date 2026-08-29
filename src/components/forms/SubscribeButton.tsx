"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SDK_SRC_PREFIX = "https://www.paypal.com/sdk/js";

function loadPaypalSdk(clientId: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("paypal-sdk-script-vault");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "paypal-sdk-script-vault";
    // vault=true + intent=subscription: modo específico del SDK para
    // suscripciones (createSubscription en vez de createOrder).
    script.src = `${SDK_SRC_PREFIX}?client-id=${clientId}&vault=true&intent=subscription`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPal"));
    document.body.appendChild(script);
  });
}

export function SubscribeButton({
  planId,
  confirmUrl,
  containerId,
}: {
  planId: string;
  confirmUrl: string;
  containerId: string;
}) {
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId || done) return;
    loadPaypalSdk(clientId)
      .then(() => setSdkReady(true))
      .catch(() => setError("No se pudo cargar PayPal. Revisá tu conexión e intentá de nuevo."));
  }, [clientId, done]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !buttonsContainerRef.current || done) return;
    buttonsContainerRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: { layout: "horizontal", color: "gold", label: "subscribe", height: 45 },
      createSubscription: async () => planId,
      onApprove: async (data) => {
        if (!data.subscriptionID) return;
        const res = await fetch(confirmUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId: data.subscriptionID }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "No se pudo confirmar la suscripción");
          return;
        }
        setDone(true);
        router.refresh();
      },
      onError: () => setError("Ocurrió un error con PayPal. Intentá de nuevo en un momento."),
    }).render(`#${containerId}`);
  }, [sdkReady, planId, confirmUrl, done, router, containerId]);

  if (done) {
    return <p className="text-sm font-semibold text-success-600">¡Listo! Ya está activo.</p>;
  }

  if (!clientId) {
    return <p className="text-xs text-navy-800/50">Los pagos todavía no están configurados en este entorno.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
      {!sdkReady ? (
        <p className="text-xs text-navy-800/40">Cargando PayPal...</p>
      ) : (
        <div id={containerId} ref={buttonsContainerRef} />
      )}
    </div>
  );
}
