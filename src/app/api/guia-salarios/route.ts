import { NextResponse } from "next/server";
import { listSalaryGuideCategories } from "@/lib/salary-guide";

// Dato 100% estático que no cambia por usuario ni por request -- el
// Cache-Control largo hace que Vercel lo sirva desde su CDN/edge en
// visitas repetidas sin volver a ejecutar esta función. (El Edge Runtime
// como modo de ejecución de la función está deprecado en esta versión de
// Next.js -- ver AGENTS.md -- así que el ahorro real acá viene del cacheo
// en el borde de la respuesta, no de dónde corre el código.)
export async function GET() {
  return NextResponse.json(
    { categories: listSalaryGuideCategories() },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
  );
}
