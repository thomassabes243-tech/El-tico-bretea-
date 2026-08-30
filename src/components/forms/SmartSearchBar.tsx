"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, SlidersHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";

// Buscador del Home: el ícono de lupa + Enter hacen la búsqueda de texto
// libre de siempre (form GET normal, sin JS). El botón "Buscar con IA" es
// aparte -- manda la misma frase a /api/ai/buscar para que la convierta en
// palabras clave más efectivas antes de buscar (útil para frases largas
// tipo "busco trabajo de ayudante de cocina cerca de Guadalajara, tiempo
// completo"). Si la IA no está configurada en el servidor (falta
// ANTHROPIC_API_KEY), cae de nuevo a la búsqueda de texto normal en vez de
// dejar al usuario sin nada.
export function SmartSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const searchWithAi = async () => {
    const text = query.trim();
    if (!text || loadingAi) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Sin IA configurada (u otro error): igual buscamos con el texto
        // tal cual, para que la persona no se quede sin resultado.
        setAiError(data.error || "No se pudo usar la IA, buscando con tu texto tal cual.");
        router.push(`/buscar/resultados?q=${encodeURIComponent(text)}`);
        return;
      }
      router.push(`/buscar/resultados?q=${encodeURIComponent(data.query || text)}`);
    } catch {
      router.push(`/buscar/resultados?q=${encodeURIComponent(text)}`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="mt-4">
      <form action="/buscar/resultados" method="GET">
        <div className="flex items-center gap-2 rounded-2xl border border-sand-200 bg-white px-4 py-3.5 shadow-lg shadow-navy-900/[0.08]">
          <Search className="h-4.5 w-4.5 shrink-0 text-navy-800/40" />
          <input
            type="text"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué chamba estás buscando?"
            className="w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-800/40 outline-none"
          />
        </div>
      </form>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={searchWithAi}
          disabled={loadingAi || !query.trim()}
          className="flex items-center gap-1.5 rounded-full bg-navy-900/[0.06] px-3 py-1.5 text-[11px] font-bold text-navy-800 transition-colors disabled:opacity-40"
        >
          {loadingAi ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Buscar con IA
        </button>
        <Link
          href="/buscar"
          className="flex items-center gap-1.5 rounded-full bg-navy-900/[0.06] px-3 py-1.5 text-[11px] font-bold text-navy-800"
        >
          <SlidersHorizontal className="h-3 w-3" /> Filtros
        </Link>
      </div>
      {aiError && <p className="mt-1.5 text-[11px] text-navy-800/45">{aiError}</p>}
    </div>
  );
}
