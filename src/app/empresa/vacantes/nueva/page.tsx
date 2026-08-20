import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/layout/AuthShell";
import { JobPostingForm } from "@/components/forms/JobPostingForm";

export default async function NuevaVacantePage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  return (
    <AuthShell title="Publicar brete" subtitle="Los trabajadores podrán verla y aplicar directamente.">
      <JobPostingForm />
    </AuthShell>
  );
}
