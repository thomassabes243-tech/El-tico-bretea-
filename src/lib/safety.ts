import { prisma } from "@/lib/prisma";

// Sección 22: bloquea que una empresa TODAVÍA NO VERIFICADA pida/comparta
// datos de contacto directo en el chat de comunidad -- es un patrón típico
// para sacar a la persona del chat moderado hacia un canal sin vigilancia
// antes de tener ninguna garantía de que la empresa es real. Son patrones
// (heurística), no una lista exhaustiva -- puede haber falsos positivos y
// negativos; nunca se aplica a mensajes de trabajadores, solo de empresas.
const PHONE_PATTERN = /(?:\+?52[\s.-]?)?\(?\d{2,3}\)?[\s.-]?\d{3,4}[\s.-]?\d{4}\b/;
const ADDRESS_PATTERN = /\b(calle|avenida|av\.|colonia|col\.|c\.?p\.?\s*\d{4,5}|fraccionamiento|domicilio)\b/i;
const CURP_PATTERN = /\b[A-Z]{4}\d{6}[A-Z0-9]{8}\b/i;
const LONG_ID_PATTERN = /\b\d{8,18}\b/;

// Borrado automático de ubicaciones vencidas (Sección 22) -- mismo patrón
// perezoso que cleanupExpiredChatFiles en src/lib/storage.ts.
export async function cleanupExpiredLocationShares(): Promise<number> {
  const { count } = await prisma.locationShare.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  return count;
}

export function detectContactInfoLeak(text: string): string | null {
  if (PHONE_PATTERN.test(text)) return "Parece contener un número de teléfono";
  if (ADDRESS_PATTERN.test(text)) return "Parece contener una dirección";
  if (CURP_PATTERN.test(text)) return "Parece contener una CURP";
  if (LONG_ID_PATTERN.test(text)) return "Parece contener un número de identificación";
  return null;
}

// Sección 22: cuántos reportes GRAVE sin resolver contra la misma cuenta
// disparan la suspensión automática (isBlocked = true). No distingue el rol
// del reportado -- aplica igual a empresa, trabajador o cuenta cualquiera.
const GRAVE_REPORTS_FOR_AUTO_SUSPEND = 3;

export async function maybeAutoSuspend(targetUserId: string) {
  const graveCount = await prisma.report.count({
    where: { targetId: targetUserId, severity: "GRAVE", resolved: false },
  });
  if (graveCount >= GRAVE_REPORTS_FOR_AUTO_SUSPEND) {
    await prisma.user.update({ where: { id: targetUserId }, data: { isBlocked: true } });
    return true;
  }
  return false;
}

// Redondea coordenadas a ~1-2 cuadras de precisión (3 decimales ≈ 111m) en
// vez de la ubicación exacta -- aproximación sin depender de un proveedor
// externo de geocodificación (ver nota en el chat sobre nombre real de
// colonia, que sí requeriría una API key).
export function approximateCoordinates(latitude: number, longitude: number) {
  return {
    latitude: Math.round(latitude * 1000) / 1000,
    longitude: Math.round(longitude * 1000) / 1000,
  };
}

const EARTH_RADIUS_KM = 6371;

function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Heurísticas de sospecha de ubicación falsa -- NO es detección real de
// mock location (esa señal no existe en el navegador web). Solo marca casos
// llamativos para que un moderador los revise; nunca bloquea solo.
export async function detectSuspiciousLocation(
  workerId: string,
  point: { latitude: number; longitude: number; accuracy?: number }
): Promise<string | null> {
  if (typeof point.accuracy === "number" && point.accuracy > 0 && point.accuracy < 1) {
    return "Precisión GPS irregularmente exacta (menor a 1 metro)";
  }

  const previous = await prisma.locationShare.findFirst({
    where: { workerId },
    orderBy: { createdAt: "desc" },
  });
  if (!previous) return null;

  const elapsedHours = (Date.now() - previous.createdAt.getTime()) / (1000 * 60 * 60);
  if (elapsedHours <= 0) return null;

  const distanceKm = haversineKm(previous, point);
  const impliedSpeedKmh = distanceKm / elapsedHours;

  // Más rápido que un vuelo comercial entre dos puntos consecutivos: salto
  // de posición imposible para un desplazamiento real.
  if (impliedSpeedKmh > 900) {
    return `Salto de ubicación implausible (~${Math.round(distanceKm)} km en ${elapsedHours.toFixed(1)}h)`;
  }

  return null;
}
