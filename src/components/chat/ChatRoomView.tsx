"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, ImagePlus, Briefcase, Lock, X, ShieldBan } from "lucide-react";
import { Card } from "@/components/ui/Card";

type ChatMessage = {
  id: string;
  type: "TEXT" | "JOB_SHARE";
  content: string | null;
  createdAt: string;
  author: { id: string; role: string; name: string };
  jobPosting: {
    id: string;
    title: string;
    location: string;
    companyName: string;
    companyVerified: boolean;
    isActive: boolean;
  } | null;
  files: { id: string; width: number | null; height: number | null }[];
};

type CompanyJob = { id: string; title: string };

export function ChatRoomView({
  categorySlug,
  initialMessages,
  initialBlocked,
  currentUserId,
  isCompany,
  companyJobs,
  canModerate,
}: {
  categorySlug: string;
  initialMessages: ChatMessage[];
  initialBlocked: boolean;
  currentUserId: string;
  isCompany: boolean;
  companyJobs: CompanyJob[];
  canModerate: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedAuthorIds, setBlockedAuthorIds] = useState<Set<string>>(new Set());
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTimestampRef = useRef<string | undefined>(
    initialMessages.at(-1)?.createdAt
  );

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const url = `/api/comunidad/${categorySlug}/messages${
          lastTimestampRef.current ? `?after=${encodeURIComponent(lastTimestampRef.current)}` : ""
        }`;
        const res = await fetch(url);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setBlocked(Boolean(data.blocked));
        if (data.messages?.length) {
          setMessages((prev) => {
            const known = new Set(prev.map((m: ChatMessage) => m.id));
            const fresh = data.messages.filter((m: ChatMessage) => !known.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
          lastTimestampRef.current = data.messages.at(-1).createdAt;
        }
      } catch {
        // silencioso: reintenta en el próximo ciclo
      }
    }

    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [categorySlug]);

  const sendText = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/comunidad/${categorySlug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar el mensaje");
      }
      const message: ChatMessage = await res.json();
      setMessages((prev) => [...prev, message]);
      lastTimestampRef.current = message.createdAt;
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setSending(false);
    }
  };

  const sendPhoto = async (file: File) => {
    setUploadingPhoto(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/comunidad/${categorySlug}/messages/foto`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo subir la foto");
      }
      const message: ChatMessage = await res.json();
      setMessages((prev) => [...prev, message]);
      lastTimestampRef.current = message.createdAt;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const shareJob = async (jobPostingId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/comunidad/${categorySlug}/compartir-vacante`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPostingId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo compartir la vacante");
      }
      const message: ChatMessage = await res.json();
      setMessages((prev) => [...prev, message]);
      lastTimestampRef.current = message.createdAt;
      setShowJobPicker(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    }
  };

  const blockAuthor = async (authorId: string) => {
    try {
      const res = await fetch(`/api/comunidad/${categorySlug}/bloqueos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authorId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo bloquear");
      }
      setBlockedAuthorIds((prev) => new Set(prev).add(authorId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-navy-800/50">
              Aún no hay publicaciones en esta sala. ¡Sé el primero!
            </p>
          )}
          {messages.map((m) => {
            const isMine = m.author.id === currentUserId;
            if (m.type === "JOB_SHARE" && m.jobPosting) {
              const isClosed = !m.jobPosting.isActive;
              return (
                <Card
                  key={m.id}
                  className={
                    isClosed
                      ? "border-sand-200 bg-sand-100/60 p-3.5 opacity-70"
                      : "border-cr-red-600/20 bg-cr-red-100/30 p-3.5"
                  }
                >
                  <p
                    className={`mb-1.5 text-[11px] font-bold uppercase tracking-wide ${
                      isClosed ? "text-navy-800/50" : "text-cr-red-700"
                    }`}
                  >
                    {isClosed
                      ? "Vacante cerrada"
                      : m.jobPosting.companyVerified
                        ? "Vacante empresarial verificada ✓"
                        : "Vacante empresarial"}
                  </p>
                  <Link href={`/vacantes/${m.jobPosting.id}`} className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ${
                        isClosed ? "text-navy-800/40" : "text-cr-red-600"
                      }`}
                    >
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-navy-900">{m.jobPosting.title}</p>
                      <p className="truncate text-xs text-navy-800/60">
                        {m.jobPosting.companyName} · {m.jobPosting.location}
                      </p>
                    </div>
                  </Link>
                </Card>
              );
            }

            return (
              <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div className="mb-0.5 flex items-center gap-1.5 px-1 text-[11px] text-navy-800/45">
                  <span className="font-semibold text-navy-800/70">{m.author.name}</span>
                  <span>·</span>
                  <span>Publicación comunitaria</span>
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    isMine ? "bg-navy-900 text-white" : "bg-white text-navy-900 border border-sand-200"
                  }`}
                >
                  {m.files.length > 0 && (
                    <div className="mb-1.5 overflow-hidden rounded-xl">
                      {m.files.map((f) => (
                        // eslint-disable-next-line @next/next/no-img-element -- imágenes efímeras servidas por API, no aptas para el optimizador estático
                        <img
                          key={f.id}
                          src={`/api/chat/files/${f.id}`}
                          alt="Foto compartida en el chat"
                          className="max-h-72 w-full object-cover"
                        />
                      ))}
                    </div>
                  )}
                  {m.content && <p className="whitespace-pre-line">{m.content}</p>}
                </div>
                {canModerate && !isMine && m.author.role !== "MODERATOR" && (
                  blockedAuthorIds.has(m.author.id) ? (
                    <span className="mt-1 px-1 text-[11px] font-semibold text-cr-red-600">
                      Bloqueado de esta sala
                    </span>
                  ) : (
                    <button
                      onClick={() => blockAuthor(m.author.id)}
                      className="mt-1 flex items-center gap-1 px-1 text-[11px] font-medium text-navy-800/40 hover:text-cr-red-600"
                    >
                      <ShieldBan className="h-3 w-3" /> Bloquear de esta sala
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mx-4 mb-2 rounded-lg bg-cr-red-100 px-3 py-1.5 text-xs font-medium text-cr-red-700">
          {error}
        </p>
      )}

      {showJobPicker && (
        <Card className="mx-4 mb-2 flex flex-col gap-1.5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-navy-900">Elegí una vacante para compartir</p>
            <button onClick={() => setShowJobPicker(false)} className="text-navy-800/40">
              <X className="h-4 w-4" />
            </button>
          </div>
          {companyJobs.length === 0 ? (
            <p className="text-xs text-navy-800/50">No tenés vacantes activas en esta categoría.</p>
          ) : (
            companyJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => shareJob(job.id)}
                className="rounded-lg px-2.5 py-2 text-left text-sm text-navy-900 hover:bg-sand-100"
              >
                {job.title}
              </button>
            ))
          )}
        </Card>
      )}

      {blocked ? (
        <div className="mx-4 mb-4 flex items-center gap-2.5 rounded-xl bg-sand-100 px-4 py-3 text-sm text-navy-800/60">
          <Lock className="h-4 w-4 shrink-0" />
          Un moderador te bloqueó el acceso a esta sala. Podés ver el historial, pero no publicar.
        </div>
      ) : (
        <div className="border-t border-sand-200 bg-white px-4 py-3">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) sendPhoto(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sand-200 text-navy-800/60 disabled:opacity-50"
              aria-label="Adjuntar foto"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            {isCompany && (
              <button
                type="button"
                onClick={() => setShowJobPicker((v) => !v)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sand-200 text-navy-800/60"
                aria-label="Compartir vacante"
              >
                <Briefcase className="h-5 w-5" />
              </button>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
              placeholder="Escribí un mensaje..."
              rows={1}
              className="h-11 flex-1 resize-none rounded-xl border border-sand-200 px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-800/35 outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
            />
            <button
              type="button"
              onClick={sendText}
              disabled={sending || !text.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white disabled:opacity-40"
              aria-label="Enviar"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
