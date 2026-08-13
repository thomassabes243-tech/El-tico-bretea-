import { AuthShell } from "@/components/layout/AuthShell";
import { WorkerRegistrationForm } from "@/components/forms/WorkerRegistrationForm";

export default function RegistroTrabajadorPage() {
  return (
    <AuthShell
      title="Perfil de trabajador"
      subtitle="Completá tus datos para crear tu perfil profesional."
    >
      <WorkerRegistrationForm />
    </AuthShell>
  );
}
