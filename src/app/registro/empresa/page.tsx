import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/layout/AuthShell";
import { CompanyRegistrationForm } from "@/components/forms/CompanyRegistrationForm";

// Esta pantalla crea una cuenta NUEVA (pide correo y contraseña) -- no es
// "completar mi perfil de empresa". Sin este chequeo, una redirección
// interna con un bug (o alguien que vuelve a esta URL con el botón atrás)
// podía mandar a un usuario YA logueado acá, pidiéndole el correo de nuevo
// y devolviendo "Ya existe una cuenta con ese correo" al enviar el propio.
export default async function RegistroEmpresaPage() {
  const session = await auth();
  if (session?.user) redirect("/perfil");

  return (
    <AuthShell
      title="Perfil de empresa"
      subtitle="Completá los datos de tu empresa. La verificación ✓ llega tras la revisión del equipo."
    >
      <CompanyRegistrationForm />
    </AuthShell>
  );
}
