import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { X, UserPlus } from "lucide-react";
import { assignModerator, removeModeratorAssignment } from "./actions";

export default async function AdminModeradoresPage() {
  const [moderators, rooms] = await Promise.all([
    prisma.moderator.findMany({
      include: { user: true, assignments: { include: { chatRoom: true } } },
      orderBy: { user: { email: "asc" } },
    }),
    prisma.chatRoom.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Moderadores</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Un moderador solo puede bloquear/desbloquear usuarios en las salas que tenga asignadas.
      </p>

      <Card className="mt-5 p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <UserPlus className="h-4 w-4" /> Asignar moderador a una sala
        </h2>
        <form action={assignModerator} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
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
          <Button type="submit" size="sm">Asignar</Button>
        </form>
      </Card>

      <div className="mt-5 flex flex-col gap-2.5">
        {moderators.length === 0 && (
          <Card className="p-6 text-center text-sm text-navy-800/60">Todavía no hay moderadores.</Card>
        )}
        {moderators.map((m) => (
          <Card key={m.id} className="p-4">
            <p className="text-sm font-semibold text-navy-900">{m.user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {m.assignments.length === 0 && (
                <span className="text-xs text-navy-800/45">Sin salas asignadas</span>
              )}
              {m.assignments.map((a) => (
                <span
                  key={a.id}
                  className="flex items-center gap-1.5 rounded-full bg-sand-100 py-1 pl-1 pr-2 text-xs font-medium text-navy-800/70"
                >
                  <CategoryIcon category={a.chatRoom.category} size="sm" />
                  {a.chatRoom.name}
                  <form
                    action={async () => {
                      "use server";
                      await removeModeratorAssignment(a.id);
                    }}
                  >
                    <button type="submit" className="text-navy-800/40 hover:text-cr-red-600" title="Quitar">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
