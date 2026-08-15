"use client";

import { useRef, useState } from "react";
import { AlertTriangle, FileText, Trash2, Upload } from "lucide-react";

export function CriminalRecordUpload({
  initialUploaded,
  initialUploadedAt,
  onChange,
}: {
  initialUploaded: boolean;
  initialUploadedAt: string | null;
  onChange?: (uploaded: boolean) => void;
}) {
  const [uploaded, setUploaded] = useState(initialUploaded);
  const [uploadedAt, setUploadedAt] = useState(initialUploadedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/perfil/trabajador/hoja-delincuencia", {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "No se pudo subir el documento");
      setUploaded(true);
      setUploadedAt(body.uploadedAt);
      onChange?.(true);
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
      const res = await fetch("/api/perfil/trabajador/hoja-delincuencia", { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo quitar el documento");
      setUploaded(false);
      setUploadedAt(null);
      onChange?.(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5 rounded-xl border border-mx-red-600/20 bg-mx-red-100/40 p-3.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-mx-red-600" />
        <p className="text-xs leading-relaxed text-navy-800/75">
          <strong className="text-navy-900">Es información sensible.</strong> Subirla es
          completamente opcional y es tu responsabilidad decidir si la incluís y a quién se la
          compartís. Nunca la mostramos en tu perfil público ni a otras cuentas — solo se
          incluye en el PDF de tu CV si vos lo elegís explícitamente al descargarlo.
        </p>
      </div>

      {uploaded ? (
        <div className="flex items-center gap-3 rounded-xl border border-sand-200 p-3">
          <FileText className="h-5 w-5 shrink-0 text-navy-700" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy-900">Documento subido</p>
            {uploadedAt && (
              <p className="truncate text-xs text-navy-800/50">
                {new Date(uploadedAt).toLocaleDateString("es-MX")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-mx-red-600/25 px-2.5 py-1.5 text-xs font-semibold text-mx-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Quitar
          </button>
        </div>
      ) : (
        <div>
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
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sand-200 py-3 text-sm font-semibold text-navy-800/60 hover:border-navy-700/40 hover:text-navy-800 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> {busy ? "Subiendo..." : "Subir carta de antecedentes penales (foto o escaneo)"}
          </button>
        </div>
      )}

      {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
    </div>
  );
}
