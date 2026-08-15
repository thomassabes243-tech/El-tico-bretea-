"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "lucide-react";

export function ShareJobButton({ jobId, title, siteUrl }: { jobId: string; title: string; siteUrl: string }) {
  const [copied, setCopied] = useState(false);

  const url = `${siteUrl}/vacantes/${jobId}`;
  const shareText = `${title} — mirá esta vacante en Méxicosinhambre`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible: no hacemos nada, el usuario puede copiar el enlace del navegador
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-navy-800/50">
        <Share2 className="h-3.5 w-3.5" /> Compartir esta vacante
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-success-600/10 px-3 py-2 text-xs font-bold text-success-600"
        >
          WhatsApp
        </a>
        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-navy-900/[0.08] px-3 py-2 text-xs font-bold text-navy-800"
        >
          Facebook
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-lg border border-sand-200 px-3 py-2 text-xs font-bold text-navy-800/70"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success-600" /> : <Link2 className="h-3.5 w-3.5" />}
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>
    </div>
  );
}
