import Link from "next/link";
import { Compass } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <LogoMark size={44} />
      <Card className="mt-6 flex max-w-sm flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-navy-800">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-extrabold text-navy-900">Página no encontrada</h1>
        <p className="text-sm text-navy-800/60">
          Puede que el enlace esté vencido o la vacante/perfil ya no exista.
        </p>
        <Button href="/" size="sm">Volver al inicio</Button>
        <Link href="/buscar" className="text-xs font-semibold text-cr-red-600">
          Buscar vacantes
        </Link>
      </Card>
    </div>
  );
}
