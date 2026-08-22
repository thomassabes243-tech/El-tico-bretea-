import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EyeOff, Eye, Trash2, MapPin } from "lucide-react";
import { createMeetingPoint, toggleMeetingPointActive, deleteMeetingPoint } from "./actions";

export default async function AdminPuntosEncuentroPage() {
  const points = await prisma.safeMeetingPoint.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-navy-700" />
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Puntos de encuentro seguros</h1>
      </div>
      <p className="mt-1 text-sm text-navy-800/60">
        Lugares públicos verificados por ciudad, para sugerir como sitio de la primera
        entrevista en vez de una dirección privada.
      </p>

      <Card className="mt-5 p-4">
        <h2 className="text-sm font-bold text-navy-900">Nuevo punto</h2>
        <form action={createMeetingPoint} className="mt-3 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-navy-800/60">Nombre</label>
            <input
              name="name"
              required
              placeholder="Ej. Plaza pública del centro"
              className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-800/60">Dirección</label>
            <input
              name="address"
              required
              placeholder="Dirección completa"
              className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-navy-800/60">Ciudad</label>
              <input
                name="city"
                required
                placeholder="Ej. Guadalajara"
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-800/60">Estado</label>
              <input
                name="state"
                required
                placeholder="Ej. Jalisco"
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
          </div>
          <Button type="submit" size="sm" className="self-start">Agregar punto</Button>
        </form>
      </Card>

      <div className="mt-5 flex flex-col gap-2.5">
        {points.length === 0 && (
          <Card className="p-6 text-center text-sm text-navy-800/60">
            Todavía no cargaste ningún punto de encuentro.
          </Card>
        )}
        {points.map((p) => (
          <Card key={p.id} className={`flex items-center gap-3 p-3.5 ${!p.isActive ? "opacity-60" : ""}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-900/[0.07] text-navy-800">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-900">{p.name}</p>
              <p className="truncate text-xs text-navy-800/50">{p.address}</p>
              <p className="truncate text-[11px] text-navy-800/35">{p.city}, {p.state}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await toggleMeetingPointActive(p.id, !p.isActive);
              }}
            >
              <button
                type="submit"
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                  p.isActive ? "border-sand-200 text-navy-800/70" : "border-success-600/30 text-success-600"
                }`}
              >
                {p.isActive ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Activar
                  </>
                )}
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                await deleteMeetingPoint(p.id);
              }}
            >
              <button
                type="submit"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-mx-red-600/25 px-2.5 py-1.5 text-xs font-semibold text-mx-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Borrar
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
