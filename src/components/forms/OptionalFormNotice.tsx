import { ReactNode } from "react";
import { Info } from "lucide-react";

export function OptionalFormNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl border border-navy-700/15 bg-navy-900/[0.03] p-3.5">
      <Info className="h-4 w-4 shrink-0 text-navy-700" />
      <p className="text-xs leading-relaxed text-navy-800/70">{children}</p>
    </div>
  );
}
