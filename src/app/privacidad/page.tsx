import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CONTACT_EMAIL } from "@/lib/constants";

const SECTIONS = [
  {
    title: "Qué información recopilamos",
    body: "Al crear tu cuenta como trabajador recopilamos datos de identidad, contacto, experiencia laboral, estudios, habilidades y referencias que vos mismo proporcionás. Las empresas proporcionan datos comerciales de contacto. Nunca solicitamos carta de antecedentes penales ni documentos de esa naturaleza — si una empresa la necesita, ese trámite se maneja directo y en privado entre ambas partes, fuera de la app.",
  },
  {
    title: "Pública, privada y sensible",
    body: "Separamos tu información en tres niveles: pública (lo que vos elegís mostrar en tu perfil), privada (contacto y expectativa salarial, visibles solo para vos salvo que decidas compartirlos) y sensible (credenciales de acceso, nunca compartidas). Vos controlás qué se muestra en tu perfil público en todo momento.",
  },
  {
    title: "Archivos del chat",
    body: "Las fotos y archivos compartidos en los chats se eliminan automáticamente 24 horas después de subirse. No se almacenan en la base de datos, sino en almacenamiento de objetos y se comprimen automáticamente. Tu perfil y tu CV no se eliminan con ese mismo plazo.",
  },
  {
    title: "Currículum en PDF",
    body: "El PDF generado a partir de tu perfil se elimina automáticamente 3 meses después de su creación. Te avisaremos antes de eliminarlo. Los datos de tu perfil permanecen intactos.",
  },
  {
    title: "Reportes y bloqueos",
    body: "Podés reportar o bloquear a otro usuario, o reportar una oferta o empresa, desde la app. Los moderadores asignados a una sala de chat solo pueden bloquear el acceso de un usuario a esa sala específica — no tienen acceso a información administrativa sensible.",
  },
  {
    title: "Autenticación",
    body: "El acceso a tu cuenta se realiza únicamente con correo electrónico y contraseña. No solicitamos ni utilizamos verificación por SMS.",
  },
  {
    title: "Eliminación de cuenta",
    body: "Podés solicitar la eliminación de tu cuenta y de tus datos personales en cualquier momento desde tu perfil o escribiéndonos.",
  },
];

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Política de privacidad</h1>
        <p className="mt-2 text-sm text-navy-800/60">
          Cómo cuidamos tu información en El Tico Bretea.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {SECTIONS.map((s) => (
            <Card key={s.title} className="p-4">
              <h2 className="text-sm font-bold text-navy-900">{s.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-navy-800/65">{s.body}</p>
            </Card>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-navy-800/50">
          ¿Preguntas sobre tu privacidad? Escribinos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-cr-red-600">
            {CONTACT_EMAIL}
          </a>
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
