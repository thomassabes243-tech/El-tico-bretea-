"use client";

import { useEffect, useState } from "react";
import { ShieldOff, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

type BlockedUser = {
  id: string;
  userId: string;
  name: string;
  email: string;
  reason: string | null;
  createdAt: string;
};

export function ModerationPanel({ categorySlug }: { categorySlug: string }) {
  const [blocks, setBlocks] = useState<BlockedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/comunidad/${categorySlug}/bloqueos`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la lista");
        return res.json();
      })
      .then((data) => setBlocks(data.blocks))
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, [categorySlug]);

  const unblock = async (userId: string) => {
    setUnblockingId(userId);
    try {
      const res = await fetch(`/api/comunidad/${categorySlug}/bloqueos?userId=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo desbloquear");
      setBlocks((prev) => prev?.filter((b) => b.userId !== userId) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setUnblockingId(null);
    }
  };

  if (error) {
    return <p className="p-4 text-sm text-mx-red-600">{error}</p>;
  }

  if (blocks === null) {
    return (
      <div className="flex justify-center p-8 text-navy-800/40">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-xs text-navy-800/50">
        Como moderador, podés bloquear el acceso de un usuario a esta sala directamente desde
        sus mensajes en el chat. Acá podés revisar y desbloquear.
      </p>
      {blocks.length === 0 ? (
        <Card className="p-6 text-center text-sm text-navy-800/60">
          No hay usuarios bloqueados en esta sala.
        </Card>
      ) : (
        blocks.map((b) => (
          <Card key={b.id} className="flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-900">{b.name}</p>
              <p className="truncate text-xs text-navy-800/50">{b.email}</p>
              {b.reason && <p className="mt-1 text-xs text-navy-800/60">Motivo: {b.reason}</p>}
            </div>
            <button
              onClick={() => unblock(b.userId)}
              disabled={unblockingId === b.userId}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-sand-200 px-2.5 py-1.5 text-xs font-semibold text-navy-800/70 disabled:opacity-50"
            >
              <ShieldOff className="h-3.5 w-3.5" /> Desbloquear
            </button>
          </Card>
        ))
      )}
    </div>
  );
}
