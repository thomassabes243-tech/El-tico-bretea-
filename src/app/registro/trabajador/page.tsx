import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/layout/AuthShell";
import { WorkerRegistrationForm } from "@/components/forms/WorkerRegistrationForm";

// Mismo motivo que /registro/empresa: esta pantalla crea una cuenta NUEVA,
// no corresponde mostrarla a alguien que ya tiene sesión iniciada.
export default async function RegistroTrabajadorPage() {
  const session = await auth();
  if (session?.user) redirect("/perfil");

  return (
    <AuthShell
      title="Perfil de trabajador"
      subtitle="Completá tus datos para crear tu perfil profesional."
    >
      <WorkerRegistrationForm />
    </AuthShell>
  );
}
