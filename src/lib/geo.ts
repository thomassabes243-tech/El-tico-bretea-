// Distancia real entre dos puntos GPS, sin depender de ningún servicio de
// mapas pago (fórmula de Haversine, solo matemática). Función pura -- se usa
// tanto en el servidor (heurísticas de seguridad en src/lib/safety.ts) como
// en el navegador (tarjetas comparativas de Cotizaciones, calculado en el
// cliente a partir de las coordenadas ya recibidas, sin ida y vuelta extra
// al servidor por cada render).

const EARTH_RADIUS_KM = 6371;

export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function distanceKmBetween(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  return distanceKm(a.latitude, a.longitude, b.latitude, b.longitude);
}
