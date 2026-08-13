"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function SaveWorkerButton({
  workerId,
  initialSaved,
}: {
  workerId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    const nextSaved = !saved;
    try {
      const res = await fetch(`/api/trabajadores/${workerId}/guardar`, {
        method: nextSaved ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error();
      setSaved(nextSaved);
    } catch {
      // sin cambios si falla
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
        saved ? "border-navy-900 bg-navy-900 text-white" : "border-sand-200 text-navy-800/70"
      }`}
    >
      {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      {saved ? "Guardado" : "Guardar perfil"}
    </button>
  );
}
