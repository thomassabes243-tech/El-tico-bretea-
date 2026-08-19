import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/layout/AuthShell";
import { ScamAlertForm } from "@/components/forms/ScamAlertForm";

export default async function NuevaAlertaPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  return (
    <AuthShell
      title="Reportar oferta sospechosa"
      subtitle="Se publica con tu alias (si tenés uno configurado en tu perfil) o tu nombre. Cualquier persona puede verla, sin necesitar cuenta."
    >
      <ScamAlertForm />
    </AuthShell>
  );
}
