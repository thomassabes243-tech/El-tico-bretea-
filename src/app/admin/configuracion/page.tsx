import { getAppSettings } from "@/lib/settings";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SetupPaypalPlansButton } from "@/components/forms/SetupPaypalPlansButton";
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
          <p className="mt-1 text-xs text-navy-800/50">
            La descarga del CV en PDF es gratuita. Estos precios son para las suscripciones vía
            PayPal.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <FieldLabel label="Premium (trabajador)" hint="por mes" />
              <input
                name="premiumPricePesos"
                type="number"
                min={0}
                defaultValue={settings.premiumPricePesos}
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
            <div>
              <FieldLabel label="Plan Profesional (Cotizaciones)" hint="por mes" />
              <input
                name="professionalPricePesos"
                type="number"
                min={0}
                defaultValue={settings.professionalPricePesos}
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
            <div>
              <FieldLabel label="Plan Empleador (más vacantes activas)" hint="por mes" />
              <input
                name="employerPlanPricePesos"
                type="number"
                min={0}
                defaultValue={settings.employerPlanPricePesos}
                className="mt-1 h-10 w-full rounded-lg border border-sand-200 px-3 text-sm"
              />
            </div>
          </div>
        </Card>

        <Button type="submit" className="self-start">Guardar cambios</Button>
      </form>

      <Card className="mt-5 p-4">
        <h2 className="text-sm font-bold text-navy-900">Planes de suscripción en PayPal</h2>
        <p className="mt-1 text-xs text-navy-800/50">
          Paso único (se repite solo si cambiás un precio de arriba): crea en PayPal los planes de
          cobro recurrente para que los botones de suscripción funcionen. Usa las mismas
          credenciales de PayPal ya configuradas, no hace falta ninguna cuenta nueva.
        </p>
        <dl className="mt-3 flex flex-col gap-1 text-xs text-navy-800/70">
          <div>
            <dt className="inline font-semibold text-navy-900">Premium: </dt>
            <dd className="inline">{settings.paypalPremiumPlanId ? "✅ Creado" : "⚠️ Falta crear"}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-navy-900">Plan Profesional: </dt>
            <dd className="inline">{settings.paypalProfessionalPlanId ? "✅ Creado" : "⚠️ Falta crear"}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-navy-900">Plan Empleador: </dt>
            <dd className="inline">{settings.paypalEmployerPlanId ? "✅ Creado" : "⚠️ Falta crear"}</dd>
          </div>
        </dl>
        <div className="mt-3">
          <SetupPaypalPlansButton />
        </div>
      </Card>
    </div>
  );
}
