import { LABOR_CATEGORIES } from "@/lib/constants";

// Guía de referencia de salario mensual típico en MXN por categoría laboral,
// para el "semáforo de seguridad" que compara el salario ofrecido contra lo
// usual del rubro. Son rangos de referencia amplios (no un dato oficial de
// INEGI ni de ninguna fuente externa) -- la idea es detectar casos MUY fuera
// de lo normal (posible explotación si es demasiado bajo, posible estafa si
// es demasiado alto), no juzgar cada oferta con precisión. Editable a mano
// acá mismo si hace falta ajustar algún rango.
//
// Es un dato 100% estático (no depende de la base de datos), así que se
// puede: (a) empaquetar directo en el bundle del cliente -- cero viajes al
// servidor por cada oferta mostrada en una lista -- y (b) servir además
// desde una ruta en el edge con Cache-Control largo, para quien prefiera
// consumirla por fetch en vez de importarla.
export const SALARY_GUIDE_MXN: Partial<Record<string, { min: number; max: number }>> = {
  CONSTRUCCION: { min: 6000, max: 12000 },
  HOTELES_TURISMO: { min: 6000, max: 11000 },
  RESTAURANTES: { min: 5500, max: 10000 },
  LIMPIEZA: { min: 5500, max: 9000 },
  TRANSPORTE: { min: 6500, max: 13000 },
  SEGURIDAD: { min: 6000, max: 11000 },
  OFICINAS_ADMINISTRACION: { min: 7000, max: 14000 },
  VENTAS_COMERCIO: { min: 6000, max: 13000 },
  TECNOLOGIA: { min: 12000, max: 30000 },
  PROFESIONALES: { min: 12000, max: 28000 },
  // SIN_ESPECIFICAR queda afuera a propósito: no hay un rubro real que comparar.
};

export type SemaforoLevel = "verde" | "amarillo" | "rojo";

export interface SemaforoResult {
  level: SemaforoLevel;
  message: string;
}

// Extrae un salario mensual estimado en MXN de un texto libre como
// "$8,000 - $10,000" o "10000 mensual". Si hay dos números los promedia
// (interpreta el texto como un rango). Devuelve null si no encuentra nada
// razonable -- nunca inventa un número para no mostrar un semáforo engañoso.
export function parseMonthlySalaryMxn(text: string): number | null {
  const matches = text.match(/\d{1,3}(?:[,.]\d{3})*(?:\.\d+)?/g);
  if (!matches || matches.length === 0) return null;

  const numbers = matches
    .map((m) => Number(m.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (numbers.length === 0) return null;

  const value = numbers.length >= 2 ? (numbers[0] + numbers[1]) / 2 : numbers[0];

  // Límites de cordura: fuera de este rango probablemente no es un salario
  // mensual en pesos (podría ser semanal, anual, u otra cosa) -- mejor no
  // mostrar nada que arriesgar una comparación equivocada.
  if (value < 500 || value > 250000) return null;
  return value;
}

export function evaluateSalarySemaforo(
  offeredMonthlyMxn: number,
  range: { min: number; max: number }
): SemaforoResult {
  const { min, max } = range;

  if (offeredMonthlyMxn >= min * 0.85 && offeredMonthlyMxn <= max * 1.2) {
    return { level: "verde", message: "Dentro de lo típico para esta categoría" };
  }
  if (offeredMonthlyMxn < min * 0.85) {
    if (offeredMonthlyMxn < min * 0.6) {
      return {
        level: "rojo",
        message: "Muy por debajo de lo típico para esta categoría — revisá bien la oferta",
      };
    }
    return { level: "amarillo", message: "Por debajo de lo típico para esta categoría" };
  }
  if (offeredMonthlyMxn > max * 1.8) {
    return {
      level: "rojo",
      message: "Mucho más alto de lo típico — verificá que la oferta sea real antes de dar tus datos",
    };
  }
  return { level: "amarillo", message: "Por encima de lo típico para esta categoría" };
}

// Une el parseo + la comparación -- devuelve null si la categoría no tiene
// guía o el texto no se pudo interpretar como salario mensual.
export function getSalarySemaforo(category: string, salaryText: string | null): SemaforoResult | null {
  if (!salaryText) return null;
  const range = SALARY_GUIDE_MXN[category];
  if (!range) return null;
  const value = parseMonthlySalaryMxn(salaryText);
  if (value == null) return null;
  return evaluateSalarySemaforo(value, range);
}

// Usado por la ruta /api/guia-salarios para no listar categorías sin guía.
export function listSalaryGuideCategories() {
  return LABOR_CATEGORIES.filter((c) => SALARY_GUIDE_MXN[c.value]).map((c) => ({
    ...c,
    range: SALARY_GUIDE_MXN[c.value]!,
  }));
}
