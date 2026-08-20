import Link from "next/link";
import { HardHat, Building2, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Card } from "@/components/ui/Card";

export default function RegistroPage() {
  return (
    <AuthShell
      title="Creá tu cuenta"
      subtitle="Elegí el tipo de cuenta que mejor te describe."
    >
      <div className="flex flex-col gap-3.5">
        <Link href="/registro/trabajador">
          <Card className="flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-active">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-navy-800">
              <HardHat className="h-6 w-6" strokeWidth={2.1} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-navy-900">Soy trabajador</p>
              <p className="text-xs text-navy-800/60">
                Creá tu perfil, tu CV y aplicá a vacantes
              </p>
            </div>
            <ArrowRight className="h-4.5 w-4.5 text-navy-800/40" />
          </Card>
        </Link>

        <Link href="/registro/empresa">
          <Card className="flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-active">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cr-red-600/[0.09] text-cr-red-600">
              <Building2 className="h-6 w-6" strokeWidth={2.1} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-navy-900">Soy empresa</p>
              <p className="text-xs text-navy-800/60">
                Publicá vacantes y encontrá talento tico
              </p>
            </div>
            <ArrowRight className="h-4.5 w-4.5 text-navy-800/40" />
          </Card>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-navy-800/60">
        ¿Ya tenés cuenta?{" "}
        <Link href="/iniciar-sesion" className="font-semibold text-cr-red-600">
          Iniciá sesión
        </Link>
      </p>
    </AuthShell>
  );
}
