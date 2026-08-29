"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SetupPaypalPlansButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const run = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/admin/paypal/planes", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear el plan");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" size="sm" onClick={run} disabled={submitting}>
        {submitting ? "Creando..." : "Crear/actualizar planes de PayPal"}
      </Button>
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
      {done && <p className="text-xs font-medium text-success-600">Listo.</p>}
    </div>
  );
}
