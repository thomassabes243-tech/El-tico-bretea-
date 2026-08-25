"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, ImagePlus, Briefcase, Lock, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ChatMessageList, type ChatMessage } from "@/components/chat/ChatMessageList";

type CompanyJob = { id: string; title: string };

export function ChatRoomView({
  initialMessages,
  initialBlocked,
  currentUserId,
  isCompany,
  companyJobs,
  canModerate,
}: {
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
  // Un poll que ya estaba en vuelo cuando se borró un mensaje puede resolver
  // después del borrado y devolver ese mismo mensaje (la consulta corrió
  // antes de que se borrara del lado del servidor) -- sin esto, el mensaje
  // borrado reaparecería solo al llegar la siguiente respuesta del poll.
  const deletedIdsRef = useRef<Set<string>>(new Set());

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
        const url = `/api/comunidad/messages${
          lastTimestampRef.current ? `?after=${encodeURIComponent(lastTimestampRef.current)}` : ""
        }`;
        const res = await fetch(url);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setBlocked(Boolean(data.blocked));
        if (data.messages?.length) {
          setMessages((prev) => {
            const known = new Set(prev.map((m: ChatMessage) => m.id));
            const fresh = data.messages.filter(
              (m: ChatMessage) => !known.has(m.id) && !deletedIdsRef.current.has(m.id)
            );
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
  }, []);

  const sendText = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/comunidad/messages`, {
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
      const res = await fetch(`/api/comunidad/messages/foto`, {
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
      const res = await fetch(`/api/comunidad/compartir-vacante`, {
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

  const blockAuthor = useCallback(async (authorId: string) => {
    try {
      const res = await fetch(`/api/comunidad/bloqueos`, {
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
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!window.confirm("¿Borrar esta publicación? No se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/comunidad/messages/${messageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo borrar la publicación");
      }
      deletedIdsRef.current.add(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    }
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          <ChatMessageList
            messages={messages}
            currentUserId={currentUserId}
            canModerate={canModerate}
            blockedAuthorIds={blockedAuthorIds}
            onBlockAuthor={blockAuthor}
            onDeleteMessage={deleteMessage}
          />
        </div>
      </div>

      {error && (
        <p className="mx-4 mb-2 shrink-0 rounded-lg bg-mx-red-100 px-3 py-1.5 text-xs font-medium text-mx-red-700">
          {error}
        </p>
      )}

      {showJobPicker && (
        <Card className="mx-4 mb-2 flex shrink-0 flex-col gap-1.5 p-3">
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
        <div className="mx-4 mb-4 flex shrink-0 items-center gap-2.5 rounded-xl bg-sand-100 px-4 py-3 text-sm text-navy-800/60">
          <Lock className="h-4 w-4 shrink-0" />
          Un moderador te bloqueó el acceso a esta sala. Podés ver el historial, pero no publicar.
        </div>
      ) : (
        <div className="shrink-0 border-t border-sand-200 bg-white px-4 py-3">
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
