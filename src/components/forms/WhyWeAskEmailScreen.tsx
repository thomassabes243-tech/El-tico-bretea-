import { Mail, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Pantalla previa al campo de correo en el registro (trabajador y empresa):
// explica en una frase simple para qué se usa, antes de pedirlo, en vez de
// mostrar el campo sin ningún contexto. Mismo principio que la explicación
// previa a un permiso del sistema (ubicación, cámara, notificaciones): decir
// para qué sirve ANTES de pedirlo, no solo mostrar el campo/diálogo pelado.
export function WhyWeAskEmailScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-navy-800">
        <Mail className="h-6 w-6" strokeWidth={2.1} />
      </div>
      <h2 className="text-base font-bold text-navy-900">¿Para qué te pedimos tu correo?</h2>
      <p className="text-sm leading-relaxed text-navy-800/70">
        Lo usamos únicamente para que puedas iniciar sesión y, si alguna vez olvidás tu
        contraseña, para mandarte un código y poder recuperarla. Nunca lo compartimos ni se
        muestra en tu perfil público.
      </p>
      <p className="flex items-center gap-1.5 text-xs font-medium text-navy-800/50">
        <ShieldCheck className="h-3.5 w-3.5" /> Solo se te pide una vez, acá al principio.
      </p>
      <Button type="button" onClick={onContinue} fullWidth>
        Entendido, continuar
      </Button>
    </Card>
  );
}
