// Integración con la API de Gemini (Google) para las 3 funciones de IA
// pedidas por el dueño del producto: buscador en lenguaje natural, mejorar
// CV, y señales a revisar en una oferta. Mismo estilo fetch-based que
// src/lib/paypal.ts y src/lib/email.ts -- sin SDK nuevo. Mismo patrón ya
// probado en src/lib/ai-import.ts (Importar oferta, panel admin), que usa
// esta misma API y esta misma variable de entorno.
//
// Requiere GEMINI_API_KEY configurada en el servidor (Vercel) -- conseguí
// una en https://aistudio.google.com/apikey. Sin esa variable, cada función
// devuelve null/lanza un error identificable en vez de fallar de forma
// críptica -- mismo patrón que sendPasswordResetEmail cuando falta
// RESEND_API_KEY. Tiene costo real por cada llamada (cobra la cuenta de
// Google del dueño del producto, no la de esta sesión).

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class AiNotConfiguredError extends Error {
  constructor() {
    super("La función de IA no está configurada en este servidor (falta GEMINI_API_KEY).");
    this.name = "AiNotConfiguredError";
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function callGemini(
  system: string,
  userMessage: string,
  maxTokens = 512,
  jsonResponse = false
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError();

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        ...(jsonResponse ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini rechazó la solicitud (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new Error("Respuesta de IA con formato inesperado");
  return text;
}

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("La IA no devolvió un JSON reconocible");
  return JSON.parse(match[0]);
}

// 1. Buscador inteligente: convierte una frase libre ("busco trabajo de
// ayudante de cocina cerca de Guadalajara, tiempo completo") en un texto de
// búsqueda limpio contra el motor existente (que busca por texto libre en
// título/descripción/ubicación/empresa -- no hay filtros estructurados
// todavía, así que la IA distila la frase en vez de armar un filtro que no
// existe).
export async function aiSearchToQuery(freeText: string): Promise<string> {
  const text = await callGemini(
    `Convertís una búsqueda de empleo en español (México) escrita en lenguaje natural en una
frase corta de palabras clave para buscar por texto libre (título, descripción, ubicación,
empresa). Quitá relleno ("busco", "quiero", "cerca de"), dejá el tipo de trabajo y el lugar.
Respondé SOLO un JSON: {"query": "..."}. Máximo 8 palabras.`,
    freeText,
    200,
    true
  );
  const parsed = extractJson(text) as { query?: string };
  return (parsed.query || freeText).trim().slice(0, 120);
}

// 2. Mejorar CV: sugerencias de texto sobre el perfil ya cargado -- nunca
// sobreescribe nada solo, el trabajador decide qué copiar a su perfil.
export async function aiImproveCv(worker: {
  fullName: string;
  profession: string;
  workExperience: string | null;
  skills: string | null;
  yearsExperience: number;
}): Promise<string> {
  const summary = `Nombre: ${worker.fullName}
Profesión: ${worker.profession}
Años de experiencia: ${worker.yearsExperience}
Experiencia laboral descrita: ${worker.workExperience || "(vacío)"}
Habilidades descritas: ${worker.skills || "(vacío)"}`;

  return callGemini(
    `Ayudás a trabajadores mexicanos a mejorar la redacción de su currículum para búsqueda de
empleo (construcción, hotelería, restaurantes, limpieza, oficinas, etc.). Dado el perfil,
sugerí en español, en 3 a 5 viñetas cortas y concretas, cómo redactar mejor su experiencia y
habilidades para que suene profesional y específico -- nunca inventes datos que la persona no
dio. Si un campo está vacío, sugerí qué tipo de información conviene agregar ahí. Respondé
solo las viñetas en texto plano, sin JSON, sin encabezados.`,
    summary,
    500
  );
}

// 3. Analizar oferta: señales que conviene revisar -- nunca afirma que es
// una estafa, solo describe qué conviene verificar antes de acudir.
export async function aiAnalyzeJobPosting(job: {
  title: string;
  description: string;
  salary: string | null;
  location: string;
  whatsapp: string | null;
  contactEmail: string | null;
  companyVerified: boolean;
}): Promise<string> {
  const summary = `Título: ${job.title}
Descripción: ${job.description}
Salario ofrecido: ${job.salary || "(no especificado)"}
Ubicación: ${job.location}
Contacto por WhatsApp: ${job.whatsapp ? "sí" : "no"}
Contacto por correo: ${job.contactEmail ? "sí" : "no"}
Empresa verificada por la plataforma: ${job.companyVerified ? "sí" : "no"}`;

  return callGemini(
    `Analizás ofertas de trabajo en México para ayudar a un trabajador a decidir si conviene
verificar algo antes de acudir a una entrevista. NUNCA afirmes que una oferta es una estafa o
que es falsa -- eso no lo podés saber. Señalá en español, en viñetas cortas, qué puntos
concretos convendría revisar (ej: salario fuera de lo típico, poca información del empleador,
solicitud de pagos por adelantado, contacto solo por mensajería, descripción vaga o
contradictoria). Si no encontrás señales relevantes, decilo así, en una sola línea: "No se
detectaron señales particulares para revisar, pero igual verificá los datos antes de acudir."
Respondé solo las viñetas o esa línea, en texto plano, sin JSON, sin encabezados, sin acusar.`,
    summary,
    400
  );
}
