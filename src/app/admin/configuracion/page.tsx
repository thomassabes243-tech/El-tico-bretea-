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
          <h2 className="text-sm font-bold text-navy-900">Precios (₡)</h2>
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

        <Card className="p-4">
          <h2 className="text-sm font-bold text-navy-900">Cobro por SINPE Móvil</h2>
          <p className="mt-1 text-xs text-navy-800/50">
            El número y nombre que se le muestran al trabajador para que transfiera manualmente
            y desbloquee la descarga del CV. Sin esto, no se muestra ninguna forma de pagar.
            Los pagos se aprueban a mano en «Pagos de CV» revisando el código que la persona
            pega después de transferir.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <FieldLabel label="Número SINPE Móvil" />
              <input
                name="sinpeMovilNumber"
                type="text"
                placeholder="8888-8888"
                defaultValue={settings.sinpeMovilNumber ?? ""}
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
            <div>
              <FieldLabel label="Nombre de la cuenta" hint="para que confirmen que es correcto" />
              <input
                name="sinpeMovilName"
                type="text"
                placeholder="Ej. Juan Pérez"
                defaultValue={settings.sinpeMovilName ?? ""}
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <FieldLabel
                label="WhatsApp de contacto"
                hint="para pagar más rápido, y para moderadores que pidan una pausa"
              />
              <input
                name="contactWhatsapp"
                type="text"
                placeholder="50688881234 (código de país + número, sin signos)"
                defaultValue={settings.contactWhatsapp ?? ""}
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
            <div>
              <FieldLabel label="Nombre de contacto" hint="se muestra junto al WhatsApp de arriba" />
              <input
                name="contactName"
                type="text"
                placeholder="Ej. Juan Pérez"
                defaultValue={settings.contactName ?? ""}
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
