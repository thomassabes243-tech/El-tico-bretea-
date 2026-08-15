"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ApplyButton({ jobPostingId }: { jobPostingId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const apply = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/vacantes/${jobPostingId}/aplicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar la aplicación");
      }
      setApplied(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-success-600/10 px-4 py-3 text-sm font-semibold text-success-600">
        <CheckCircle2 className="h-4 w-4" /> ¡Aplicación enviada!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mensaje para la empresa (opcional)"
        className="h-20 w-full resize-none rounded-xl border border-sand-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-800/35 outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
      />
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
      <Button onClick={apply} disabled={isSubmitting} fullWidth>
        {isSubmitting ? "Enviando..." : "Aplicar a esta vacante"} <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
