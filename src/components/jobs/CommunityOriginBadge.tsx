import { Megaphone } from "lucide-react";

// Se usa dondequiera que se muestre una JobPosting con
// origin === "CHAT_COMUNIDAD" (ver src/lib/job-auto-detect.ts), en vez de
// los datos formales de empresa -- nadie la verificó, la detectó la IA a
// partir de un mensaje del chat.
export function CommunityOriginBadge() {
  return (
    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-warning-600">
      <Megaphone className="h-3 w-3" /> Publicado en el chat — no verificado
    </p>
  );
}
