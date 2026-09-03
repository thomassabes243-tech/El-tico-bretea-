// Detección heurística de ofertas que piden pago/depósito por adelantado --
// la modalidad de estafa más común reportada en canales de empleo en
// México. Es un simple scan de palabras clave sobre el texto de la propia
// vacante (título, descripción, requisitos), NO un análisis con IA (eso ya
// existe aparte en AnalyzeJobButton/lib/ai.ts, es complementario a esto:
// esto es gratis, instantáneo y sin costo de API, y se muestra siempre que
// haya coincidencia, no solo cuando el usuario aprieta un botón).
const UPFRONT_PAYMENT_KEYWORDS = [
  "depósito",
  "deposito",
  "pago por adelantado",
  "pago adelantado",
  "cuota de inscripción",
  "cuota de inscripcion",
  "cuota de registro",
  "kit de trabajo",
  "kit de arranque",
  "capacitación paga",
  "capacitacion paga",
  "curso pagado",
  "transferencia previa",
  "pagar para empezar",
  "inversión inicial",
  "inversion inicial",
  "abono inicial",
  "envía tu ine",
  "envia tu ine",
  "manda tu ine",
  "manda una foto de tu identificación",
  "manda una foto de tu identificacion",
  "pagar el uniforme antes",
  "materiales por tu cuenta antes",
];

/** Frases de la lista de arriba que aparecen en el texto, tal como están escritas (para mostrárselas al usuario). */
export function detectPaymentScamSignals(text: string): string[] {
  const lower = text.toLowerCase();
  return UPFRONT_PAYMENT_KEYWORDS.filter((keyword) => lower.includes(keyword));
}
