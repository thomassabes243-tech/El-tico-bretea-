import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { aiSearchToQuery, AiNotConfiguredError } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

// Requiere sesión (no anónimo) para no dejar que cualquiera sin cuenta
// consuma el presupuesto de la API de Gemini -- misma lógica de costo
// real que las otras funciones de IA de esta ruta.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Iniciá sesión para usar el buscador con IA" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(`ai-buscar:${session.user.id}`, 20, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Probaste varias veces seguidas. Esperá un rato." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim().slice(0, 300) : "";
  if (!query) {
    return NextResponse.json({ error: "Escribí qué chamba estás buscando" }, { status: 400 });
  }

  try {
    const refined = await aiSearchToQuery(query);
    return NextResponse.json({ query: refined });
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo procesar la búsqueda" },
      { status: 502 }
    );
  }
}
