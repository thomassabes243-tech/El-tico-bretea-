import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CONTACT_EMAIL } from "@/lib/constants";
import { HeartHandshake, ShieldCheck, Wallet } from "lucide-react";

export default function AcercaDePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Acerca de El Mexa Chamba</h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-800/70">
          El Mexa Chamba nace para ayudar al mexicano a conseguir trabajo de forma directa y
          confiable, conectando a trabajadores y empresas sin intermediarios que compliquen
          el proceso.
        </p>

        <Card className="mt-5 flex items-start gap-3.5 p-4">
          <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-navy-700" />
          <div>
            <h2 className="text-sm font-bold text-navy-900">¿Por qué cobramos por algunas cosas?</h2>
            <p className="mt-1 text-xs leading-relaxed text-navy-800/65">
              La descarga del CV en PDF y la suscripción Premium tienen un costo pequeño.
              Ese cobro no busca un lucro agresivo: es lo que nos permite cubrir el
              mantenimiento de la app y los servidores para que siga funcionando y
              mejorando. Buscar trabajo, crear tu perfil, aplicar a vacantes y participar en
              la comunidad es y seguirá siendo gratuito.
            </p>
          </div>
        </Card>

        <Card className="mt-4 flex items-start gap-3.5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
          <div>
            <h2 className="text-sm font-bold text-navy-900">Privacidad primero</h2>
            <p className="mt-1 text-xs leading-relaxed text-navy-800/65">
              Nunca pedimos carta de antecedentes penales ni documentos similares. Vos
              decidís qué información de tu perfil es pública.
            </p>
          </div>
        </Card>

        <Card className="mt-4 flex items-start gap-3.5 p-4">
          <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-mx-red-600" />
          <div>
            <h2 className="text-sm font-bold text-navy-900">Donaciones voluntarias</h2>
            <p className="mt-1 text-xs leading-relaxed text-navy-800/65">
              Si la app te ayudó a conseguir trabajo, podés apoyar su mantenimiento con una
              donación voluntaria. Nunca es obligatoria ni da beneficios especiales.
            </p>
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-navy-800/50">
          Contacto para publicidad o negocios:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-mx-red-600">
            {CONTACT_EMAIL}
          </a>
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
