import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { X } from "lucide-react";
import { removeModeratorAssignment } from "./actions";
import { AssignModeratorForm } from "@/components/admin/AssignModeratorForm";

const ROLE_LABEL: Record<string, string> = {
  WORKER: "Trabajador",
  COMPANY: "Empresa",
  MODERATOR: "Solo moderador",
};

export default async function AdminModeradoresPage() {
  const [moderators, rooms] = await Promise.all([
    prisma.moderator.findMany({
      include: {
        user: { include: { workerProfile: true, companyProfile: true } },
        assignments: { include: { chatRoom: true } },
      },
      orderBy: { user: { email: "asc" } },
    }),
    prisma.chatRoom.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Moderadores</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Un moderador puede borrar mensajes/fotos y bloquear/desbloquear usuarios solo en las
        salas que tenga asignadas. Como admin, vos podés hacer eso en cualquier sala sin
        necesitar asignación.
      </p>

      <AssignModeratorForm rooms={rooms} />

      <div className="mt-5 flex flex-col gap-2.5">
        {moderators.length === 0 && (
          <Card className="p-6 text-center text-sm text-navy-800/60">Todavía no hay moderadores.</Card>
        )}
        {moderators.map((m) => {
          const displayName = m.user.workerProfile?.fullName ?? m.user.companyProfile?.commercialName ?? null;
          return (
          <Card key={m.id} className="p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-navy-900">{displayName ?? m.user.email}</p>
              <Badge tone="neutral">{ROLE_LABEL[m.user.role] ?? m.user.role}</Badge>
            </div>
            {displayName && <p className="text-xs text-navy-800/50">{m.user.email}</p>}
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
                    <button type="submit" className="text-navy-800/40 hover:text-mx-red-600" title="Quitar">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </span>
              ))}
            </div>
          </Card>
          );
        })}
      </div>
    </div>
  );
}
