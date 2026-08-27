import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";

const SECTIONS = [
  {
    title: "Objetivo de la plataforma",
    body: "El Mexa Chamba conecta a trabajadores y empresas en México. No garantizamos contratación ni resultados de ninguna búsqueda: facilitamos el contacto directo y confiable entre las partes.",
  },
  {
    title: "Tipos de cuenta",
    body: "Existen cuentas de trabajador, de empresa y de moderador. Los moderadores tienen una función limitada a bloquear el acceso de usuarios a salas de chat específicas asignadas a ellos, sin acceso a información administrativa sensible.",
  },
  {
    title: "Veracidad de la información",
    body: "Al registrarte, aceptás que la información de tu perfil (o de tu empresa) es veraz. Las empresas obtienen la insignia de verificación tras completar sus datos y pasar una revisión del equipo administrador.",
  },
  {
    title: "Cobros",
    body: "La descarga del CV en PDF y la suscripción Premium tienen un costo fijado en pesos, ajustable desde el panel administrativo. Estos cobros cubren el mantenimiento de la app y no constituyen una garantía de empleo. Las donaciones son voluntarias y no otorgan beneficios adicionales.",
  },
  {
    title: "Conducta y moderación",
    body: "Está prohibido el acoso, la discriminación, la publicación de contenido falso o el uso de la plataforma para fines distintos a la búsqueda de empleo y personal. Podés reportar o bloquear a otros usuarios en cualquier momento.",
  },
  {
    title: "Eliminación de cuenta",
    body: "Podés eliminar tu cuenta cuando quieras. La eliminación borra tu perfil y datos asociados según lo descrito en nuestra Política de Privacidad.",
  },
];

export default function TerminosPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Términos de servicio</h1>
        <p className="mt-2 text-sm text-navy-800/60">
          Las reglas básicas para usar El Mexa Chamba.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {SECTIONS.map((s) => (
            <Card key={s.title} className="p-4">
              <h2 className="text-sm font-bold text-navy-900">{s.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-navy-800/65">{s.body}</p>
            </Card>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
