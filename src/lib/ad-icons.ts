import { Sparkles, FileText, MessagesSquare, HeartHandshake, Briefcase, Users, ShieldCheck } from "lucide-react";

// Set fijo de íconos que un anuncio puede usar (elegible desde el admin).
// Archivo separado de ads.ts a propósito: este es seguro para importar
// desde componentes cliente (sin dependencias de servidor como prisma/auth).
export const ICON_OPTIONS = {
  sparkles: { label: "Destello (Premium)", icon: Sparkles },
  "file-text": { label: "Documento (CV)", icon: FileText },
  "messages-square": { label: "Chat (Comunidad)", icon: MessagesSquare },
  "heart-handshake": { label: "Corazón (Donar)", icon: HeartHandshake },
  briefcase: { label: "Maletín (Vacantes)", icon: Briefcase },
  users: { label: "Personas (Buscar personal)", icon: Users },
  "shield-check": { label: "Escudo (Confianza)", icon: ShieldCheck },
} as const;

export type IconKey = keyof typeof ICON_OPTIONS;

export function iconForKey(key: string) {
  return (ICON_OPTIONS as Record<string, (typeof ICON_OPTIONS)[IconKey]>)[key]?.icon ?? Sparkles;
}

export type AdItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  iconKey: string;
};
