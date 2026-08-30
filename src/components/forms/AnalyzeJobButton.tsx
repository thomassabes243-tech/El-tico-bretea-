"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// "Señales que conviene revisar" -- nunca "esto es una estafa". Ver
// src/lib/ai.ts (aiAnalyzeJobPosting).
export function AnalyzeJobButton({ jobPostingId }: { jobPostingId: string }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch("/api/ai/analizar-oferta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo analizar la oferta");
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button type="button" variant="outline" size="sm" onClick={run} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {loading ? "Analizando..." : "Analizar esta oferta"}
      </Button>
      {error && <p className="mt-2 text-xs font-medium text-mx-red-600">{error}</p>}
      {analysis && (
        <Card className="mt-3 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-navy-800/50">
            Señales que conviene revisar
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-800/80">
            {analysis}
          </p>
          <p className="mt-2 text-[11px] text-navy-800/40">
            Esto no significa que la oferta sea falsa -- es una guía para verificar antes de acudir.
          </p>
        </Card>
      )}
    </div>
  );
}
