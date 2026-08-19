import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { LABOR_CATEGORIES } from "@/lib/constants";

// Importar oferta desde texto/imagen de Facebook o WhatsApp (panel admin,
// solo lectura para el resto de la app): la clave de Anthropic vive
// únicamente acá, del lado del servidor -- nunca se manda al navegador.
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-5";

export type ExtractedJobFields = {
  title: string | null;
  laborCategory: string | null;
  location: string | null;
  description: string | null;
  whatsapp: string | null;
};

export class AiNotConfiguredError extends Error {
  constructor() {
    super("Falta configurar ANTHROPIC_API_KEY en el servidor.");
    this.name = "AiNotConfiguredError";
  }
}

function buildPrompt() {
  const categoryList = LABOR_CATEGORIES.map((c) => `${c.value} (${c.label})`).join(", ");
  return `Sos un asistente que extrae datos de ofertas de trabajo publicadas en Facebook o WhatsApp en Costa Rica, a partir de texto pegado y/o una imagen (captura de pantalla o foto de un cartel).

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
- El texto puede venir en español coloquial costarricense, con errores de tipeo -- interpretalo igual.`;
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError();

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
  > = [];

  if (input.imageBase64 && input.imageMediaType) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: input.imageMediaType, data: input.imageBase64 },
    });
  }
  content.push({
    type: "text",
    text: input.text.trim()
      ? `Texto de la publicación:\n${input.text.trim()}`
      : "No se pegó texto -- extraé lo que puedas de la imagen adjunta.",
  });

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: buildPrompt(),
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Anthropic API respondió ${res.status}: ${errBody.slice(0, 300)}`);
  }

  const data = await res.json();
  const rawText: string = data?.content?.[0]?.text ?? "";

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
const IMPORT_SOURCE_EMAIL = "importado.redes@eltico.cr";

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
      responsibleName: "Administración El Tico Bretea",
      contactEmail: IMPORT_SOURCE_EMAIL,
      location: "Costa Rica",
      activity: "Ofertas importadas de redes sociales por el equipo de El Tico Bretea",
      isVerified: false,
    },
  });
}
