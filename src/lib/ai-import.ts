import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { LABOR_CATEGORIES } from "@/lib/constants";

// Importar oferta desde texto/imagen de Facebook o WhatsApp (panel admin,
// solo lectura para el resto de la app): la clave de Gemini vive
// únicamente acá, del lado del servidor -- nunca se manda al navegador.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type ExtractedJobFields = {
  title: string | null;
  laborCategory: string | null;
  location: string | null;
  description: string | null;
  whatsapp: string | null;
};

export class AiNotConfiguredError extends Error {
  constructor() {
    super("Falta configurar GEMINI_API_KEY en el servidor.");
    this.name = "AiNotConfiguredError";
  }
}

function buildPrompt() {
  const categoryList = LABOR_CATEGORIES.map((c) => `${c.value} (${c.label})`).join(", ");
  return `Sos un asistente que extrae datos de ofertas de trabajo publicadas en Facebook o WhatsApp en México, a partir de texto pegado y/o una imagen (captura de pantalla o foto de un cartel).

Categorías válidas (usá EXACTAMENTE uno de estos valores, o null si ninguna encaja con seguridad): ${categoryList}

Devolvé ÚNICAMENTE un objeto JSON con esta forma exacta, sin texto adicional antes ni después:
{
  "title": string o null,
  "laborCategory": uno de los valores de categoría de arriba, o null,
  "location": string o null (lugar/provincia/cantón mencionado),
  "description": string o null (descripción del puesto en 1-3 oraciones),
  "whatsapp": string o null (número de teléfono/WhatsApp de contacto)
}

Reglas importantes:
- NUNCA inventes datos que no estén en el texto o la imagen. Si un campo no aparece, usá null.
- No agregues explicaciones, solo el JSON.
- El texto puede venir en español coloquial mexicano, con errores de tipeo -- interpretalo igual.`;
}

/**
 * Llama a la API de Claude con el texto pegado y, opcionalmente, una imagen
 * (captura de pantalla o foto del cartel), y devuelve los campos que pudo
 * identificar. Nunca inventa datos: los campos no encontrados quedan null.
 */
export async function extractJobFromText(input: {
  text: string;
  imageBase64?: string;
  imageMediaType?: string;
}): Promise<ExtractedJobFields> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError();

  const parts: Array<
    | { text: string }
    | { inline_data: { mime_type: string; data: string } }
  > = [];

  if (input.imageBase64 && input.imageMediaType) {
    parts.push({ inline_data: { mime_type: input.imageMediaType, data: input.imageBase64 } });
  }
  parts.push({
    text: input.text.trim()
      ? `Texto de la publicación:\n${input.text.trim()}`
      : "No se pegó texto -- extraé lo que puedas de la imagen adjunta.",
  });

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildPrompt() }] },
      contents: [{ role: "user", parts }],
      generationConfig: { maxOutputTokens: 1024, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Gemini API respondió ${res.status}: ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed: unknown;
  try {
    // Por si el modelo envuelve el JSON en ```json ... ``` a pesar de la instrucción.
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch {
    throw new Error("La IA no devolvió un JSON válido");
  }

  const obj = parsed as Record<string, unknown>;
  const validCategories = new Set<string>(LABOR_CATEGORIES.map((c) => c.value));
  const laborCategory = typeof obj.laborCategory === "string" && validCategories.has(obj.laborCategory)
    ? obj.laborCategory
    : null;

  return {
    title: typeof obj.title === "string" && obj.title.trim() ? obj.title.trim() : null,
    laborCategory,
    location: typeof obj.location === "string" && obj.location.trim() ? obj.location.trim() : null,
    description: typeof obj.description === "string" && obj.description.trim() ? obj.description.trim() : null,
    whatsapp: typeof obj.whatsapp === "string" && obj.whatsapp.trim() ? obj.whatsapp.trim() : null,
  };
}

// Cuenta "empresa" reservada para ofertas importadas de redes sociales sin
// una empresa registrada real detrás. Nadie inicia sesión con ella (la
// contraseña es un valor aleatorio que no se guarda en ningún lado); solo
// existe para que las ofertas importadas puedan usar el mismo modelo
// JobPosting (companyId es obligatorio) sin inventar un sistema paralelo.
const IMPORT_SOURCE_EMAIL = "importado.redes@mexicosinhambre.com";

export async function getOrCreateImportCompany() {
  const existing = await prisma.companyProfile.findFirst({
    where: { user: { email: IMPORT_SOURCE_EMAIL } },
  });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(randomUUID(), 10);
  const user = await prisma.user.create({
    data: { email: IMPORT_SOURCE_EMAIL, passwordHash, role: "COMPANY" },
  });

  return prisma.companyProfile.create({
    data: {
      userId: user.id,
      commercialName: "Publicado en Facebook/WhatsApp",
      legalId: "IMPORTADO",
      responsibleName: "Administración Méxicosinhambre",
      contactEmail: IMPORT_SOURCE_EMAIL,
      location: "México",
      activity: "Ofertas importadas de redes sociales por el equipo de Méxicosinhambre",
      isVerified: false,
    },
  });
}
