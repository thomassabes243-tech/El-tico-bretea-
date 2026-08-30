"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Sugerencias de redacción, nunca sobreescribe el perfil solo -- el
// trabajador decide qué copiar. Ver src/lib/ai.ts (aiImproveCv).
export function ImproveCvButton() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const res = await fetch("/api/ai/mejorar-cv", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo generar sugerencias");
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <Button type="button" variant="outline" onClick={run} disabled={loading} fullWidth>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Pensando..." : "Mejorar mi CV con IA"}
      </Button>
      {error && <p className="mt-2 text-xs font-medium text-mx-red-600">{error}</p>}
      {suggestions && (
        <Card className="mt-3 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-navy-800/50">
            Sugerencias -- copiá lo que te sirva a tu perfil
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-800/80">
            {suggestions}
          </p>
        </Card>
      )}
    </div>
  );
}
