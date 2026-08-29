"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldWrapper, TextInput, Textarea } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

export function ServiceQuoteForm({ serviceRequestId }: { serviceRequestId: string }) {
  const router = useRouter();
  const [priceLabel, setPriceLabel] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (submitting || !priceLabel.trim() || !availability.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/servicios/solicitudes/${serviceRequestId}/cotizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceLabel, availability, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar la cotización");
      setDone(true);
      setTimeout(() => router.push("/servicios/solicitudes"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return <p className="text-sm font-semibold text-success-600">¡Cotización enviada!</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldWrapper label="Tu precio" htmlFor="priceLabel">
        <TextInput
          id="priceLabel"
          value={priceLabel}
          onChange={(e) => setPriceLabel(e.target.value)}
          placeholder="Ej. $350 MXN"
        />
      </FieldWrapper>
      <FieldWrapper label="Tu disponibilidad" htmlFor="availability">
        <TextInput
          id="availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          placeholder="Ej. Disponible en 1 hora"
        />
      </FieldWrapper>
      <FieldWrapper label="Mensaje (opcional)" htmlFor="message">
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Algo más que quieras contarle al cliente"
        />
      </FieldWrapper>
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
      <Button onClick={submit} disabled={submitting} fullWidth>
        {submitting ? "Enviando..." : "Enviar cotización"}
      </Button>
    </div>
  );
}
