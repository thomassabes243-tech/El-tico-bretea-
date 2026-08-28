import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { DonationForm } from "@/components/forms/DonationForm";
import { HeartHandshake } from "lucide-react";

export default function DonarPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mx-red-100">
            <HeartHandshake className="h-6 w-6 text-mx-red-600" />
          </div>
          <h1 className="text-lg font-extrabold text-navy-900">
            ¿Lograste lo que buscabas?
          </h1>
          <p className="text-sm leading-relaxed text-navy-800/65">
            Si querés, podés darme una pequeña donación voluntaria. ¡Gracias! Es un monto
            libre, con tarjeta o cuenta de PayPal, sin ningún beneficio asociado — solo una
            forma de apoyar el mantenimiento de la app.
          </p>
          <div className="mt-2 w-full border-t border-sand-200 pt-5">
            <DonationForm />
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
