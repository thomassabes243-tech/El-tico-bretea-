"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, SlidersHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";

// Buscador del Home: el ícono de lupa + Enter hacen la búsqueda de texto
// libre de siempre (form GET normal, sin JS). El ícono de filtros (a la
// derecha, adentro del buscador) lleva a /buscar. El botón "Buscar con IA"
// es aparte -- manda la misma frase a /api/ai/buscar para que la convierta
// en palabras clave más efectivas antes de buscar (útil para frases largas
// tipo "busco trabajo de ayudante de cocina cerca de Guadalajara, tiempo
// completo"). Si la IA no está configurada en el servidor (falta
// GEMINI_API_KEY), cae de nuevo a la búsqueda de texto normal en vez de
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
    <div>
      <form action="/buscar/resultados" method="GET">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-800/40" strokeWidth={2} />
          <input
            type="text"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué chamba estás buscando?"
            className="h-14 w-full rounded-lg border border-sand-200 bg-white pl-12 pr-14 text-sm text-navy-900 placeholder:text-navy-800/40 outline-none transition-colors focus:border-navy-700"
          />
          <Link
            href="/buscar"
            aria-label="Filtros"
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-navy-800/60 transition-colors hover:bg-sand-100 active:scale-95"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" strokeWidth={2} />
          </Link>
        </div>
      </form>
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <p className="text-[11px] text-navy-800/40">Ej. ayudante, mesero, limpieza, plomero...</p>
        <button
          type="button"
          onClick={searchWithAi}
          disabled={loadingAi || !query.trim()}
          className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-mx-red-600 transition-opacity disabled:opacity-40"
        >
          {loadingAi ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          Buscar con IA
        </button>
      </div>
      {aiError && <p className="mt-1 px-1 text-[11px] text-navy-800/45">{aiError}</p>}
    </div>
  );
}
