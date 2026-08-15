"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

const MESSAGES = [
  "Sé parte de tu gremio: compartí, preguntá y conectá con otros como vos.",
  "Acá no solo se mira — publicá tu experiencia y ayudá a alguien más.",
  "Tu comunidad te está esperando. Entrá y presentate.",
  "¿Tenés una duda o un consejo? Compartilo con tu gremio.",
  "Mientras más mexicanos participan, más fuerte es la comunidad. Sumate vos también.",
];

const ROTATE_MS = 4500;

export function CommunityInviteBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 to-navy-950 px-4 py-3.5">
      <div className="flex items-center gap-2.5">
        <Megaphone className="h-4 w-4 shrink-0 text-mx-red-500" />
        <p key={index} className="animate-fade-in-up text-sm font-semibold leading-snug text-white">
          {MESSAGES[index]}
        </p>
      </div>
    </div>
  );
}
