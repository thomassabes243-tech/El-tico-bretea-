import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/layout/AuthShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FeatureJobButton } from "@/components/forms/FeatureJobButton";
import { CheckCircle2 } from "lucide-react";

export default async function VacantePublicadaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  const { id } = await params;
  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!jobPosting || jobPosting.company.userId !== session.user.id) notFound();

  return (
    <AuthShell title="¡Vacante publicada!" subtitle="Los trabajadores ya pueden verla y aplicar.">
      <Card className="flex items-start gap-3 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
        <div>
          <p className="text-sm font-bold text-navy-900">{jobPosting.title}</p>
          <p className="text-xs text-navy-800/50">Ya está activa en las búsquedas.</p>
        </div>
      </Card>

      <div className="mt-4">
        <FeatureJobButton jobPostingId={jobPosting.id} featuredUntil={jobPosting.featuredUntil} />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <Button href={`/vacantes/${jobPosting.id}/aplicantes`} fullWidth>
          Ver aplicantes
        </Button>
        <Link href={`/vacantes/${jobPosting.id}`} className="text-center text-xs font-semibold text-navy-800/50">
          Ver cómo la ven los trabajadores
        </Link>
      </div>
    </AuthShell>
  );
}
