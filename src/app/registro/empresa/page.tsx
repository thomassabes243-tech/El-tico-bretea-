import { AuthShell } from "@/components/layout/AuthShell";
import { CompanyRegistrationForm } from "@/components/forms/CompanyRegistrationForm";

export default function RegistroEmpresaPage() {
  return (
    <AuthShell
      title="Perfil de empresa"
      subtitle="Completá los datos de tu empresa. La verificación ✓ llega tras la revisión del equipo."
    >
      <CompanyRegistrationForm />
    </AuthShell>
  );
}
