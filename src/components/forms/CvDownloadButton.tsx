"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function CvDownloadButton({
  hasCriminalRecord,
  label,
}: {
  hasCriminalRecord: boolean;
  label: string;
}) {
  const [includeCriminalRecord, setIncludeCriminalRecord] = useState(false);

  const href = includeCriminalRecord
    ? "/api/cv/descargar?incluirHojaDelincuencia=1"
    : "/api/cv/descargar";

  return (
    <div className="mt-4 flex flex-col gap-2.5">
      {hasCriminalRecord && (
        <label className="flex items-center gap-2.5 rounded-xl border border-sand-200 p-3 text-xs font-medium text-navy-800/70">
          <input
            type="checkbox"
            checked={includeCriminalRecord}
            onChange={(e) => setIncludeCriminalRecord(e.target.checked)}
            className="h-4 w-4 shrink-0 accent-mx-red-600"
          />
          Incluir mi carta de antecedentes penales en este PDF
        </label>
      )}

      <a
        href={href}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-mx-red-600 text-sm font-semibold text-white shadow-sm shadow-mx-red-600/25 transition-all hover:bg-mx-red-700 active:scale-[0.98]"
      >
        <Download className="h-4 w-4" /> {label}
      </a>
    </div>
  );
}
