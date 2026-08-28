import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { LABOR_CATEGORIES } from "@/lib/constants";
import { textOrDefault, enumOrDefault } from "@/lib/form-defaults";
import type { LaborCategory } from "@prisma/client";

// Auto-categorización/auto-publicación desde el chat de Comunidad: cuando
// alguien escribe un mensaje que describe una changa/oferta de trabajo real
// (no charla, no alguien buscando trabajo), la IA lo detecta y crea
// automáticamente una JobPosting con origin=CHAT_COMUNIDAD -- sin
// verificar, claramente marcada como tal en la tarjeta (ver
// src/app/buscar/page.tsx y afines). Se dispara desde
// POST /api/comunidad/[category]/messages (ver esa ruta) y también puede
// dispararse a mano vía POST /api/jobs/auto-detect.
//
// Usa Gemini (GEMINI_API_KEY), no Claude -- distinto de src/lib/ai-import.ts
// (esa sí usa ANTHROPIC_API_KEY, para "Importar oferta" en el panel admin).
// La clave vive únicamente acá, del lado del servidor.

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class AiNotConfiguredError extends Error {
  constructor() {
    super("Falta configurar GEMINI_API_KEY en el servidor.");
    this.name = "AiNotConfiguredError";
  }
}

const COSTA_RICA_PROVINCES = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
];

// Mensajes más cortos que esto casi nunca alcanzan a describir una oferta
// real ("ok", "gracias", "jaja") -- se descartan antes de gastar una
// llamada a la API en cada mensaje del chat.
const MIN_MESSAGE_LENGTH = 20;

// Ventana y umbral para no publicar la misma oferta dos veces si dos
// mensajes del chat la describen por separado.
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DUPLICATE_TITLE_SIMILARITY_THRESHOLD = 0.6;

export type ExtractedChatJobOffer = {
  esOfertaTrabajo: boolean;
  titulo: string | null;
  categoria: string | null;
  provincia: string | null;
  contacto: string | null;
  descripcionCorta: string | null;
};

function buildPrompt() {
  const categoryList = LABOR_CATEGORIES.filter((c) => c.value !== "SIN_ESPECIFICAR")
    .map((c) => `${c.value} (${c.label})`)
    .join(", ");
  const provinceList = COSTA_RICA_PROVINCES.join(", ");
  return `Sos un asistente que revisa mensajes de un chat comunitario costarricense (El Tico Bretea) para detectar si describen una oferta de trabajo/changa real -- alguien que busca CONTRATAR a alguien y pagarle -- a diferencia de charla normal, alguien buscando trabajo para sí mismo, o cualquier otro tema.

Categorías válidas (usá EXACTAMENTE uno de estos valores si el mensaje deja claro el rubro, o null si no hay forma de saberlo con seguridad): ${categoryList}
Provincias de Costa Rica (usá EXACTAMENTE una de estas, o null si no se menciona): ${provinceList}

Devolvé ÚNICAMENTE un objeto JSON con esta forma exacta, sin texto adicional antes ni después:
{
  "es_oferta_trabajo": true o false,
  "titulo": string o null,
  "categoria": uno de los valores de categoría de arriba, o null,
  "provincia": una de las provincias de arriba, o null,
  "contacto": string o null (número de WhatsApp/teléfono o forma de contacto mencionada),
  "descripcion_corta": string o null (resumen de 1-2 líneas)
}

Reglas importantes:
- "es_oferta_trabajo" es true SOLO si alguien está ofreciendo pagar por un trabajo/changa concreta. Una persona pidiendo trabajo, preguntando algo, compartiendo una changa que YA es de este mismo sitio, o charlando NO cuenta -- ahí es false y el resto de los campos van null.
- NUNCA inventes datos que no estén en el texto. Si un campo no aparece, usá null.
- No agregues explicaciones, solo el JSON.
- El texto puede venir en español coloquial costarricense, con errores de tipeo -- interpretalo igual.`;
}

async function extractJobOfferFromChatMessage(text: string): Promise<ExtractedChatJobOffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError();

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildPrompt() }] },
      contents: [{ role: "user", parts: [{ text: `Mensaje del chat:\n${text}` }] }],
      generationConfig: { maxOutputTokens: 512, responseMimeType: "application/json" },
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
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch {
    throw new Error("La IA no devolvió un JSON válido");
  }

  const obj = parsed as Record<string, unknown>;
  const validCategories = new Set<string>(LABOR_CATEGORIES.map((c) => c.value));
  const validProvinces = new Set<string>(COSTA_RICA_PROVINCES);

  return {
    esOfertaTrabajo: obj.es_oferta_trabajo === true,
    titulo: typeof obj.titulo === "string" && obj.titulo.trim() ? obj.titulo.trim() : null,
    categoria:
      typeof obj.categoria === "string" && validCategories.has(obj.categoria) ? obj.categoria : null,
    provincia:
      typeof obj.provincia === "string" && validProvinces.has(obj.provincia) ? obj.provincia : null,
    contacto: typeof obj.contacto === "string" && obj.contacto.trim() ? obj.contacto.trim() : null,
    descripcionCorta:
      typeof obj.descripcion_corta === "string" && obj.descripcion_corta.trim()
        ? obj.descripcion_corta.trim()
        : null,
  };
}

// Cuenta "empresa" reservada para las ofertas que la IA detecta en el chat,
// sin una empresa real detrás -- mismo patrón que getOrCreateImportCompany
// en ai-import.ts (JobPosting.companyId es obligatorio), pero con su propia
// identidad para no mezclarla con las ofertas importadas por el admin.
const CHAT_SOURCE_EMAIL = "comunidad.chat@eltico.cr";

async function getOrCreateChatCommunityCompany() {
  const existing = await prisma.companyProfile.findFirst({
    where: { user: { email: CHAT_SOURCE_EMAIL } },
  });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(randomUUID(), 10);
  const user = await prisma.user.create({
    data: { email: CHAT_SOURCE_EMAIL, passwordHash, role: "COMPANY" },
  });

  return prisma.companyProfile.create({
    data: {
      userId: user.id,
      commercialName: "Publicado en el chat de Comunidad",
      legalId: "CHAT_COMUNIDAD",
      responsibleName: "Comunidad El Tico Bretea",
      contactEmail: CHAT_SOURCE_EMAIL,
      location: "Costa Rica",
      activity: "Ofertas detectadas automáticamente en el chat de Comunidad, sin verificar",
      isVerified: false,
    },
  });
}

function normalizeTitle(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeTitle(a).split(/\s+/).filter(Boolean));
  const wordsB = new Set(normalizeTitle(b).split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const word of wordsA) if (wordsB.has(word)) intersection++;
  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function normalizeContact(contact: string): string {
  return contact.replace(/\D/g, "");
}

async function isLikelyDuplicate(title: string, contact: string | null): Promise<boolean> {
  const recent = await prisma.jobPosting.findMany({
    where: {
      origin: "CHAT_COMUNIDAD",
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    select: { title: true, whatsapp: true },
  });

  const normalizedContact = contact ? normalizeContact(contact) : null;

  return recent.some((candidate) => {
    if (normalizedContact && candidate.whatsapp && normalizeContact(candidate.whatsapp) === normalizedContact) {
      return true;
    }
    return titleSimilarity(candidate.title, title) >= DUPLICATE_TITLE_SIMILARITY_THRESHOLD;
  });
}

export type AutoDetectResult =
  | { created: true; jobPostingId: string }
  | { created: false; reason: string };

/**
 * Revisa un mensaje del chat de Comunidad y, si describe una oferta de
 * trabajo real, crea automáticamente una JobPosting (origin=CHAT_COMUNIDAD,
 * sin verificar). Nunca lanza -- cualquier error (IA no configurada, error
 * de red, JSON inválido) se registra en consola y se trata como "no se
 * pudo detectar", para no romper nunca el envío del mensaje que la dispara.
 */
export async function detectAndCreateJobFromMessage(messageId: string): Promise<AutoDetectResult> {
  try {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { type: true, content: true },
    });

    if (!message) return { created: false, reason: "message_not_found" };
    if (message.type !== "TEXT") return { created: false, reason: "not_text_message" };
    const content = message.content?.trim() ?? "";
    if (content.length < MIN_MESSAGE_LENGTH) return { created: false, reason: "too_short" };

    const extracted = await extractJobOfferFromChatMessage(content);
    if (!extracted.esOfertaTrabajo) return { created: false, reason: "not_a_job_offer" };

    const title = textOrDefault(extracted.titulo);
    const description = textOrDefault(extracted.descripcionCorta);
    const location = textOrDefault(extracted.provincia);
    const laborCategory = enumOrDefault(extracted.categoria as LaborCategory | null);
    const whatsapp = extracted.contacto;

    if (await isLikelyDuplicate(title, whatsapp)) {
      return { created: false, reason: "duplicate" };
    }

    const company = await getOrCreateChatCommunityCompany();

    const jobPosting = await prisma.jobPosting.create({
      data: {
        companyId: company.id,
        title,
        description,
        laborCategory,
        location,
        contractType: "SIN_ESPECIFICAR",
        whatsapp,
        origin: "CHAT_COMUNIDAD",
      },
    });

    return { created: true, jobPostingId: jobPosting.id };
  } catch (err) {
    console.error("[job-auto-detect] no se pudo procesar el mensaje", messageId, err);
    return { created: false, reason: "error" };
  }
}
