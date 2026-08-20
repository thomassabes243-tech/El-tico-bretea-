"use client";

import { memo } from "react";
import Link from "next/link";
import { Briefcase, ShieldBan, Trash2, MessagesSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export type ChatMessage = {
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

/**
 * Separado de ChatRoomView para que escribir en el textarea (que cambia
 * estado en cada tecla) no fuerce a React a volver a renderizar cada
 * mensaje de la lista en cada tecla -- con memo(), esto solo se vuelve a
 * renderizar cuando realmente cambian los mensajes u otras props propias.
 */
export const ChatMessageList = memo(function ChatMessageList({
  messages,
  currentUserId,
  canModerate,
  blockedAuthorIds,
  onBlockAuthor,
  onDeleteMessage,
}: {
  messages: ChatMessage[];
  currentUserId: string;
  canModerate: boolean;
  blockedAuthorIds: Set<string>;
  onBlockAuthor: (authorId: string) => void;
  onDeleteMessage: (messageId: string) => void;
}) {
  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Todavía no hay publicaciones"
        description="Sé el primero en escribir en esta sala de la comunidad."
        className="mt-6"
      />
    );
  }

  return (
    <>
      {messages.map((m) => {
        const isMine = m.author.id === currentUserId;
        const canDelete = isMine || (canModerate && m.author.role !== "MODERATOR");

        if (m.type === "JOB_SHARE" && m.jobPosting) {
          const isClosed = !m.jobPosting.isActive;
          return (
            <Card
              key={m.id}
              className={`relative ${
                isClosed
                  ? "border-sand-200 bg-sand-100/60 p-3.5 opacity-70"
                  : "border-cr-red-600/20 bg-cr-red-100/30 p-3.5"
              }`}
            >
              {canDelete && (
                <button
                  onClick={() => onDeleteMessage(m.id)}
                  aria-label="Borrar publicación"
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg text-navy-800/30 hover:bg-white hover:text-cr-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <Badge tone={isClosed ? "neutral" : "red"} className="mb-1.5">
                {isClosed
                  ? "Vacante cerrada"
                  : m.jobPosting.companyVerified
                    ? "Vacante verificada ✓"
                    : "Vacante empresarial"}
              </Badge>
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
                      width={f.width ?? undefined}
                      height={f.height ?? undefined}
                      loading="lazy"
                      decoding="async"
                      className="max-h-72 w-full object-cover"
                    />
                  ))}
                </div>
              )}
              {m.content && <p className="whitespace-pre-line">{m.content}</p>}
            </div>
            <div className={`flex items-center gap-3 px-1 ${canDelete || canModerate ? "mt-1" : ""}`}>
              {canDelete && (
                <button
                  onClick={() => onDeleteMessage(m.id)}
                  className="flex items-center gap-1 text-[11px] font-medium text-navy-800/40 hover:text-cr-red-600"
                >
                  <Trash2 className="h-3 w-3" /> Borrar
                </button>
              )}
              {canModerate && !isMine && m.author.role !== "MODERATOR" && (
                blockedAuthorIds.has(m.author.id) ? (
                  <span className="text-[11px] font-semibold text-cr-red-600">
                    Bloqueado de esta sala
                  </span>
                ) : (
                  <button
                    onClick={() => onBlockAuthor(m.author.id)}
                    className="flex items-center gap-1 text-[11px] font-medium text-navy-800/40 hover:text-cr-red-600"
                  >
                    <ShieldBan className="h-3 w-3" /> Bloquear de esta sala
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </>
  );
});
