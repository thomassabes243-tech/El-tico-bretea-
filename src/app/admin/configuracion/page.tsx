import { getAppSettings } from "@/lib/settings";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { saveSettings } from "./actions";

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <label className="text-xs font-semibold text-navy-800/60">
      {label}
      {hint && <span className="ml-1 font-normal text-navy-800/40">({hint})</span>}
    </label>
  );
}

export default async function AdminConfiguracionPage() {
  const settings = await getAppSettings();

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Configuración</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Precios y límites, editables sin necesidad de actualizar la app.
      </p>

      <form action={saveSettings} className="mt-5 flex flex-col gap-5">
        <Card className="p-4">
          <h2 className="text-sm font-bold text-navy-900">Precios ($ MXN)</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <FieldLabel label="Descarga de CV" hint="≈ US$2" />
              <input
                name="cvPriceColones"
                type="number"
                min={0}
                defaultValue={settings.cvPriceColones}
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
            <div>
              <FieldLabel label="Premium" hint="por mes" />
              <input
                name="premiumPriceColones"
                type="number"
                min={0}
                defaultValue={settings.premiumPriceColones}
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
          </div>
        </Card>

        <Button type="submit" className="self-start">Guardar cambios</Button>
      </form>
    </div>
  );
}
