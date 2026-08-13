import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CONTACT_EMAIL } from "@/lib/constants";
import { HeartHandshake } from "lucide-react";

export default function DonarPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cr-red-100">
            <HeartHandshake className="h-6 w-6 text-cr-red-600" />
          </div>
          <h1 className="text-lg font-extrabold text-navy-900">
            ¿Lograste lo que buscabas?
          </h1>
          <p className="text-sm leading-relaxed text-navy-800/65">
            Si querés, podés darme una pequeña donación voluntaria. ¡Gracias! Es un monto
            libre, con tarjeta, sin ningún beneficio asociado — solo una forma de apoyar el
            mantenimiento de la app.
          </p>
          <p className="text-xs text-navy-800/50">
            El cobro con tarjeta está en desarrollo, a la espera de definir un procesador de
            pagos compatible con Costa Rica. Mientras tanto, si querés colaborar de otra
            forma, escribinos a{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-cr-red-600">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
