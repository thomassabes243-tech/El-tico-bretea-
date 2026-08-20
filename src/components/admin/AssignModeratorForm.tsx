"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { assignModerator, type AssignModeratorState } from "@/app/admin/moderadores/actions";

const initialState: AssignModeratorState = { error: null };

export function AssignModeratorForm({ rooms }: { rooms: { id: string; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(assignModerator, initialState);

  return (
    <Card className="mt-5 p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
        <UserPlus className="h-4 w-4" /> Asignar moderador a una sala
      </h2>
      <form action={formAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs font-semibold text-navy-800/60">Correo</label>
          <input
            name="email"
            type="email"
            required
            placeholder="moderador@correo.com"
            className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-navy-800/60">Contraseña (solo si es cuenta nueva)</label>
          <input
            name="password"
            type="text"
            placeholder="mínimo 8 caracteres"
            className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-800/60">Sala</label>
          <select name="chatRoomId" required className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm">
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Asignando..." : "Asignar"}
        </Button>
      </form>
      {state.error && (
        <p className="mt-2.5 rounded-lg bg-mx-red-100 px-3 py-2 text-xs font-medium text-mx-red-700">
          {state.error}
        </p>
      )}
    </Card>
  );
}
