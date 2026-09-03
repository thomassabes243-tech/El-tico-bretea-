"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Copy, Check } from "lucide-react";
import { PermissionPrimer } from "@/components/ui/PermissionPrimer";

type Contact = { id: string; name: string };

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Este navegador no soporta ubicación"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
  });
}

/** Reusa /api/ubicacion/compartir (Sección 22) con un motivo prellenado -- no es un sistema aparte. */
export function GoingToInterviewButton({
  contacts,
  jobTitle,
  companyName,
}: {
  contacts: Contact[];
  jobTitle: string;
  companyName: string;
}) {
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (contacts.length === 0) {
    return (
      <p className="text-xs text-navy-800/50">
        <Link href="/seguridad" className="font-semibold text-mx-red-600">Agregá un contacto de confianza</Link> para
        poder avisarle cuando vayas a esta entrevista.
      </p>
    );
  }

  const share = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const position = await getPosition();
      const res = await fetch("/api/ubicacion/compartir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trustedContactId: contactId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          label: `Entrevista: ${jobTitle} en ${companyName}`,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo compartir la ubicación");
      }
      const { shareToken } = await res.json();
      setShareLink(`${window.location.origin}/ubicacion-compartida/${shareToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo obtener tu ubicación");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareLink) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-sand-200 bg-sand-50 p-3">
        <p className="text-xs text-navy-800/60">Mandale este link a tu contacto por WhatsApp:</p>
        <div className="flex items-center gap-2">
          <input readOnly value={shareLink} className="h-9 flex-1 truncate rounded-lg border border-sand-200 px-2.5 text-xs" />
          <button onClick={copyLink} className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-navy-900 px-3 text-xs font-semibold text-white">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {contacts.length > 1 && (
        <select
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
          className="h-9 w-full rounded-lg border border-sand-200 px-2.5 text-xs"
        >
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}
      <PermissionPrimer
        icon={MapPin}
        title="Vamos a pedirte tu ubicación"
        description="Solo para generar un link de solo lectura que le mandás vos mismo a tu contacto de confianza -- la empresa nunca la ve."
        confirmLabel="Continuar"
        onConfirm={share}
      >
        {(open) => (
          <button
            type="button"
            onClick={open}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-sand-200 px-3 py-2 text-xs font-semibold text-navy-800 disabled:opacity-50"
          >
            <MapPin className="h-3.5 w-3.5" /> {busy ? "Obteniendo ubicación..." : "Voy a esta entrevista"}
          </button>
        )}
      </PermissionPrimer>
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}
