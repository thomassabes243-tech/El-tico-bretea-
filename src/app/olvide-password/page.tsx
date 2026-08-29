import { AuthShell } from "@/components/layout/AuthShell";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export default function OlvidePasswordPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te mandamos un código a tu correo para poner una contraseña nueva."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
