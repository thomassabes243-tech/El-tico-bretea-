import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ShieldBan, ShieldCheck, Sparkles } from "lucide-react";
import { toggleUserBlocked, toggleWorkerPremium } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  WORKER: "Trabajador",
  COMPANY: "Empresa",
  MODERATOR: "Moderador",
  ADMIN: "Admin",
};

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      workerProfile: { select: { id: true, fullName: true, isPremium: true } },
      companyProfile: { select: { commercialName: true } },
    },
  });

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Usuarios</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        {users.length} cuentas registradas. Bloquear impide iniciar sesión de inmediato. Mientras
        no haya pagos conectados, el Premium de un trabajador solo se puede activar desde acá.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {users.map((u) => {
          const displayName = u.workerProfile?.fullName ?? u.companyProfile?.commercialName ?? null;
          return (
            <Card key={u.id} className="flex flex-wrap items-center gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                  <span className="truncate">{displayName ?? u.email}</span>
                  <span className="shrink-0 rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-navy-800/60">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                  {u.isBlocked && (
                    <span className="shrink-0 rounded-full bg-cr-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-cr-red-700">
                      Bloqueado
                    </span>
                  )}
                  {u.workerProfile?.isPremium && (
                    <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-colon-100 px-2 py-0.5 text-[10px] font-bold uppercase text-colon-700">
                      <Sparkles className="h-2.5 w-2.5" /> Premium
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-navy-800/50">{u.email}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {u.workerProfile && (
                  <form
                    action={async () => {
                      "use server";
                      await toggleWorkerPremium(u.workerProfile!.id, !u.workerProfile!.isPremium);
                    }}
                  >
                    <button
                      type="submit"
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                        u.workerProfile.isPremium
                          ? "border-sand-200 text-navy-800/70"
                          : "border-colon-600/30 text-colon-600"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {u.workerProfile.isPremium ? "Quitar Premium" : "Dar Premium"}
                    </button>
                  </form>
                )}

                <form
                  action={async () => {
                    "use server";
                    await toggleUserBlocked(u.id, !u.isBlocked);
                  }}
                >
                  <button
                    type="submit"
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      u.isBlocked
                        ? "border-success-600/30 text-success-600"
                        : "border-sand-200 text-navy-800/70"
                    }`}
                  >
                    {u.isBlocked ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> Desbloquear
                      </>
                    ) : (
                      <>
                        <ShieldBan className="h-3.5 w-3.5" /> Bloquear
                      </>
                    )}
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
