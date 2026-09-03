"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Camera, Trash2 } from "lucide-react";
import { AvatarImage } from "@/components/brand/AvatarImage";
import { compressImageFile } from "@/lib/image-compress-client";
import { PermissionPrimer } from "@/components/ui/PermissionPrimer";

const ENDPOINT: Record<"trabajador" | "empresa", string> = {
  trabajador: "/api/perfil/trabajador/foto",
  empresa: "/api/perfil/empresa/logo",
};

export function ProfilePhotoUpload({
  kind,
  initialUrl,
  alt,
  fallback,
  shape = "circle",
}: {
  kind: "trabajador" | "empresa";
  initialUrl: string | null;
  alt: string;
  fallback: ReactNode;
  shape?: "circle" | "square";
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const res = await fetch(ENDPOINT[kind], { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "No se pudo subir la foto");
      setUrl(body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const remove = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(ENDPOINT[kind], { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo quitar la foto");
      setUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <AvatarImage
        src={url}
        alt={alt}
        fallback={fallback}
        className={`h-20 w-20 border-2 border-navy-900 object-cover ${shape === "circle" ? "rounded-full" : "rounded-2xl"}`}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      <div className="flex items-center gap-2">
        <PermissionPrimer
          icon={Camera}
          title="Vamos a abrir tu cámara o galería"
          description="Para elegir la foto -- podés cancelar antes si no querés compartir ninguna."
          confirmLabel="Continuar"
          onConfirm={() => fileInputRef.current?.click()}
        >
          {(open) => (
            <button
              type="button"
              onClick={open}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-sand-200 px-3 py-2 text-xs font-semibold text-navy-800 hover:border-navy-700/40 disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" /> {busy ? "Subiendo..." : url ? "Cambiar foto" : "Subir foto"}
            </button>
          )}
        </PermissionPrimer>
        {url && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-mx-red-600/25 px-3 py-2 text-xs font-semibold text-mx-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Quitar
          </button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}
