import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DetailHeader } from "@/components/nav/DetailHeader";
import { Card } from "@/components/ui/Card";
import { JobPostingForm } from "@/components/forms/JobPostingForm";

export default async function NuevaVacantePage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-sand-50">
      <DetailHeader title="Publicar Brete" fallbackHref="/perfil" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <Card className="p-5">
          <JobPostingForm />
        </Card>
      </main>
    </div>
  );
}
