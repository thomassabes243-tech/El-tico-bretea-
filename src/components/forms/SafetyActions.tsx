"use client";

import { useState } from "react";
import { MapPin, AlertTriangle, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Contact = { id: string; name: string; phone: string };

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Este navegador no soporta ubicación"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export function SafetyActions({ contacts }: { contacts: Contact[] }) {
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id ?? "");
  const [busy, setBusy] = useState<"location" | "panic" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLocation = async () => {
    if (!selectedContactId || busy) return;
    setBusy("location");
    setError(null);
    setShareLink(null);
    try {
      const position = await getPosition();
      const res = await fetch("/api/ubicacion/compartir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trustedContactId: selectedContactId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
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
      setBusy(null);
    }
  };

  const triggerPanic = async () => {
    if (busy) return;
    setBusy("panic");
    setError(null);
    setShareLink(null);
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;
      try {
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch {
        // seguimos sin ubicación si el navegador la bloquea -- la alerta igual se envía
      }
      const res = await fetch("/api/panico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trustedContactId: selectedContactId || undefined, latitude, longitude }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar la alerta");
      }
      const { shareToken } = await res.json();
      setShareLink(`${window.location.origin}/panico/${shareToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setBusy(null);
    }
  };

  if (contacts.length === 0) {
    return (
      <Card className="p-4 text-center text-xs text-navy-800/50">
        Agregá al menos un contacto de confianza arriba para poder compartir tu ubicación o usar
        el botón de pánico.
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <label className="text-xs font-semibold text-navy-800/60">
        Contacto de confianza
        <select
          value={selectedContactId}
          onChange={(e) => setSelectedContactId(e.target.value)}
          className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
        >
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <Button type="button" variant="outline" onClick={shareLocation} disabled={busy !== null}>
        <MapPin className="h-4 w-4" /> {busy === "location" ? "Obteniendo ubicación..." : "Compartir mi ubicación (6h)"}
      </Button>

      <button
        type="button"
        onClick={triggerPanic}
        disabled={busy !== null}
        className="flex items-center justify-center gap-2 rounded-xl bg-mx-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        <AlertTriangle className="h-4 w-4" /> {busy === "panic" ? "Enviando alerta..." : "Botón de pánico"}
      </button>

      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}

      {shareLink && (
        <div className="flex flex-col gap-2 rounded-xl border border-sand-200 bg-sand-50 p-3">
          <p className="text-xs text-navy-800/60">
            Mandale este link a tu contacto por WhatsApp — no necesita cuenta ni login:
          </p>
          <div className="flex items-center gap-2">
            <input readOnly value={shareLink} className="h-9 flex-1 truncate rounded-lg border border-sand-200 px-2.5 text-xs" />
            <button onClick={copyLink} className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-navy-900 px-3 text-xs font-semibold text-white">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
