import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CONTACT_EMAIL, CREATOR_WHATSAPP_HREF } from "@/lib/constants";
import { Mail, Phone } from "lucide-react";

export default function ContactoPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Contacto</h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-800/70">
          ¿Tenés dudas, querés reportar un problema o hablar sobre publicidad y alianzas de
          negocio? Escribinos.
        </p>

        <Card className="mt-5 flex items-center gap-3.5 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-navy-800">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-navy-800/50">Publicidad y negocios</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm font-bold text-mx-red-600">
              {CONTACT_EMAIL}
            </a>
          </div>
        </Card>

        <Card className="mt-3 flex items-center gap-3.5 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success-600/10 text-success-600">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-navy-800/50">¿Querés hablar con el creador de la app?</p>
            <a
              href={CREATOR_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-success-600"
            >
              Escribime por WhatsApp
            </a>
          </div>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
