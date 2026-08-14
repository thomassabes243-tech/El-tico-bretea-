import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldBan, ShieldCheck, Sparkles, Crown } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { toggleUserBlocked, toggleWorkerPremium, toggleUserAdmin } from "./actions";
import type { Prisma } from "@prisma/client";

const ROLE_LABELS: Record<string, string> = {
  WORKER: "Trabajador",
  COMPANY: "Empresa",
  MODERATOR: "Moderador",
  ADMIN: "Admin",
};

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAdmin();
  const { q } = await searchParams;
  const query = q?.trim();

  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { workerProfile: { fullName: { contains: query, mode: "insensitive" } } },
          { companyProfile: { commercialName: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
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
        {users.length} cuenta{users.length === 1 ? "" : "s"}
        {query ? " encontrada(s)" : " registradas"}. Bloquear impide iniciar sesión de inmediato.
        Mientras no haya pagos conectados, el Premium de un trabajador solo se puede activar
        desde acá. No hay límite de cuántas cuentas pueden ser Administrador.
      </p>

      <form className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={query ?? ""}
          placeholder="Buscar por correo o nombre..."
          className="h-11 flex-1 rounded-xl border border-sand-200 bg-white px-3.5 text-sm text-navy-900 placeholder:text-navy-800/35"
        />
        <Button type="submit" size="md">Buscar</Button>
      </form>

      <div className="mt-5 flex flex-col gap-2.5">
        {users.length === 0 && (
          <Card className="p-6 text-center text-sm text-navy-800/60">
            No se encontró ninguna cuenta con ese criterio.
          </Card>
        )}
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

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {u.role === "ADMIN" && u.id === session.user.id ? (
                  <span className="flex items-center gap-1.5 rounded-lg border border-sand-200 px-2.5 py-1.5 text-xs font-semibold text-navy-800/40">
                    <Crown className="h-3.5 w-3.5" /> Sos vos
                  </span>
                ) : (
                  <form
                    action={async () => {
                      "use server";
                      await toggleUserAdmin(u.id, u.role !== "ADMIN");
                    }}
                  >
                    <button
                      type="submit"
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                        u.role === "ADMIN"
                          ? "border-sand-200 text-navy-800/70"
                          : "border-navy-700/30 text-navy-700"
                      }`}
                    >
                      <Crown className="h-3.5 w-3.5" />
                      {u.role === "ADMIN" ? "Quitar Administrador" : "Dar Administrador"}
                    </button>
                  </form>
                )}

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
