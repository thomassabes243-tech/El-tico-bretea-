"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { FEATURED_PRICE_USD, FEATURED_DAYS } from "@/lib/constants";


const SDK_SRC_PREFIX = "https://www.paypal.com/sdk/js";

function loadPaypalSdk(clientId: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("paypal-sdk-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "paypal-sdk-script";
    script.src = `${SDK_SRC_PREFIX}?client-id=${clientId}&currency=USD&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPal"));
    document.body.appendChild(script);
  });
}

export function FeatureJobButton({
  jobPostingId,
  featuredUntil,
}: {
  jobPostingId: string;
  featuredUntil: Date | null;
}) {
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isCurrentlyFeatured = featuredUntil ? featuredUntil > new Date() : false;

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
      style: { layout: "horizontal", color: "gold", label: "pay", height: 40 },
      createOrder: async () => {
        setError(null);
        const res = await fetch("/api/paypal/destacar/crear-orden", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobPostingId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago");
        return data.orderId;
      },
      onApprove: async (data) => {
        const res = await fetch("/api/paypal/destacar/capturar-orden", {
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
        router.refresh();
      },
      onError: () => setError("Ocurrió un error con PayPal. Intentá de nuevo en un momento."),
    }).render("#paypal-destacar-buttons");
  }, [sdkReady, jobPostingId, done, router]);

  if (done || isCurrentlyFeatured) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-peso-600/25 bg-peso-100/50 px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-peso-600" />
        <p className="text-xs font-semibold text-navy-900">
          {done
            ? "¡Listo! Tu oferta ya está destacada."
            : `Destacada hasta el ${featuredUntil?.toLocaleDateString("es-MX")}.`}
        </p>
      </div>
    );
  }

  if (!clientId) return null;

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-peso-600/25 bg-peso-100/40 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4.5 w-4.5 shrink-0 text-peso-600" />
        <p className="text-sm font-bold text-navy-900">Destacá tu oferta y aparecé primero</p>
      </div>
      <p className="text-xs leading-relaxed text-navy-800/65">
        Conseguí candidatas más rápido: tu vacante aparece antes que las demás en las
        búsquedas por {FEATURED_DAYS} días, por ${FEATURED_PRICE_USD} USD (pago único).
      </p>
      {error ? (
        <p className="text-xs font-medium text-mx-red-600">{error}</p>
      ) : !sdkReady ? (
        <p className="text-xs text-navy-800/40">Cargando PayPal...</p>
      ) : (
        <div id="paypal-destacar-buttons" ref={buttonsContainerRef} />
      )}
    </div>
  );
}
