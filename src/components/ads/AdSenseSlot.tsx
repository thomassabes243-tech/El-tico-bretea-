"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID, ADSENSE_SLOT_ID } from "@/lib/ads-client";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Espacio real de Google AdSense en un lugar fijo y no invasivo (entre
 * resultados de búsqueda), en vez de depender de Auto Ads de Google -- ese
 * modo puede insertar formatos más invasivos (intersticiales, anchor ads)
 * en cualquier parte de la página, sin control fino desde acá. Este bloque
 * es siempre inline, del mismo tipo de tamaño que un anuncio propio
 * (AdSlot), nunca a pantalla completa ni superpuesto al contenido.
 *
 * Sin ADSENSE_SLOT_ID configurado (falta crear el ad unit en la cuenta de
 * AdSense), no renderiza nada -- mejor eso que un espacio de anuncio roto.
 */
export function AdSenseSlot({ eligible }: { eligible: boolean }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!eligible || !ADSENSE_SLOT_ID || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // El script de AdSense todavía no cargó (o un adblocker lo frenó) -- no rompe la página.
    }
  }, [eligible]);

  if (!eligible || !ADSENSE_SLOT_ID) return null;

  return (
    <div className="my-4">
      <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-navy-800/30">
        Publicidad
      </span>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={ADSENSE_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
