import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ICON_OPTIONS, iconForKey } from "@/lib/ad-icons";
import { EyeOff, Eye, Trash2, Megaphone } from "lucide-react";
import { createAd, toggleAdActive, deleteAd } from "./actions";

export default async function AdminPublicidadPage() {
  const ads = await prisma.advertisement.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-navy-700" />
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Publicidad</h1>
      </div>
      <p className="mt-1 text-sm text-navy-800/60">
        Anuncios propios mostrados solo a cuentas gratuitas (nunca a Premium, moderadores o
        admins), máximo uno cada ~5 minutos. Mientras no haya una red publicitaria externa
        contratada, esto es lo único que se muestra.
      </p>

      <Card className="mt-5 p-4">
        <h2 className="text-sm font-bold text-navy-900">Nuevo anuncio</h2>
        <form action={createAd} className="mt-3 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-navy-800/60">Título</label>
              <input
                name="title"
                required
                placeholder="Ej. Hacete Premium"
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-800/60">Texto del botón</label>
              <input
                name="ctaLabel"
                required
                placeholder="Ej. Ver Premium"
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-800/60">Descripción</label>
            <input
              name="description"
              required
              placeholder="Una línea corta explicando el anuncio"
              className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-navy-800/60">Enlace interno</label>
              <input
                name="href"
                required
                placeholder="/premium"
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-800/60">Ícono</label>
              <select
                name="iconKey"
                defaultValue="sparkles"
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              >
                {Object.entries(ICON_OPTIONS).map(([key, opt]) => (
                  <option key={key} value={key}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" size="sm" className="self-start">Crear anuncio</Button>
        </form>
      </Card>

      <div className="mt-5 flex flex-col gap-2.5">
        {ads.length === 0 && (
          <Card className="p-6 text-center text-sm text-navy-800/60">
            Todavía no creaste ningún anuncio. Mientras tanto se muestra uno por defecto
            (CV) -- el de Premium está desactivado mientras Premium no esté disponible.
          </Card>
        )}
        {ads.map((ad) => {
          const Icon = iconForKey(ad.iconKey);
          return (
            <Card key={ad.id} className={`flex items-center gap-3 p-3.5 ${!ad.isActive ? "opacity-60" : ""}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-900/[0.07] text-navy-800">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy-900">{ad.title}</p>
                <p className="truncate text-xs text-navy-800/50">{ad.description}</p>
                <p className="truncate text-[11px] text-navy-800/35">
                  {ad.href} · {ad.ctaLabel}
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await toggleAdActive(ad.id, !ad.isActive);
                }}
              >
                <button
                  type="submit"
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                    ad.isActive ? "border-sand-200 text-navy-800/70" : "border-success-600/30 text-success-600"
                  }`}
                >
                  {ad.isActive ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" /> Pausar
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
                  await deleteAd(ad.id);
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
          );
        })}
      </div>
    </div>
  );
}
