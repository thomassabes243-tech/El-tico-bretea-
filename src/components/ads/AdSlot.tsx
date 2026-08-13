"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { ICON_OPTIONS, type AdItem, type IconKey } from "@/lib/ad-icons";

const LAST_SHOWN_KEY = "eltico:lastAdShownAt";
const MIN_GAP_MS = 5 * 60 * 1000; // Sección 10: máximo ~1 anuncio cada 5 minutos

/**
 * Espacio de publicidad para usuarios gratuitos (Sección 10). Nunca a
 * pantalla completa: siempre una tarjeta pequeña e inline. Si hay varios
 * AdSlot montados en la misma sesión de navegación, comparten el mismo
 * temporizador en localStorage — solo uno se muestra por ventana de 5 min.
 * Los anuncios en sí vienen de /admin/publicidad (editables sin tocar código).
 */
export function AdSlot({ eligible, ads }: { eligible: boolean; ads: AdItem[] }) {
  const [ad, setAd] = useState<AdItem | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!eligible || ads.length === 0) return;
    try {
      const lastShown = Number(localStorage.getItem(LAST_SHOWN_KEY) || 0);
      if (Date.now() - lastShown < MIN_GAP_MS) return;
      localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con localStorage (sistema externo), no hay forma de leerlo antes del mount sin romper SSR
      setAd(ads[Math.floor(Math.random() * ads.length)]);
    } catch {
      // localStorage no disponible (modo privado, etc.): no mostramos anuncio
    }
  }, [eligible, ads]);

  if (!eligible || !ad || dismissed) return null;

  const Icon = ICON_OPTIONS[ad.iconKey as IconKey]?.icon ?? Sparkles;

  return (
    <div className="mt-8 rounded-2xl border border-sand-200 bg-white p-3.5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy-800/40">
          Anuncio
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-navy-800/30 hover:text-navy-800/60"
          aria-label="Cerrar anuncio"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-900/[0.07] text-navy-800">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy-900">{ad.title}</p>
          <p className="truncate text-xs text-navy-800/50">{ad.description}</p>
        </div>
        <Link href={ad.href} className="shrink-0 text-xs font-bold text-cr-red-600">
          {ad.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
