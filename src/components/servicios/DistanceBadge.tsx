"use client";

import { distanceKm } from "@/lib/geo";

// Calcula la distancia en el navegador a partir de las coordenadas que ya
// vienen en el HTML -- el servidor solo trae los pares de coordenadas, no
// recalcula la fórmula de Haversine en cada render.
export function DistanceBadge({
  aLat,
  aLon,
  bLat,
  bLon,
  className = "rounded-full bg-sand-100 px-2 py-0.5",
}: {
  aLat: number | null;
  aLon: number | null;
  bLat: number | null;
  bLon: number | null;
  className?: string;
}) {
  if (aLat == null || aLon == null || bLat == null || bLon == null) return null;
  const km = distanceKm(aLat, aLon, bLat, bLon);
  return <span className={className}>📍 {km.toFixed(1)} km</span>;
}
