import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { EditJobPostingForm } from "@/components/forms/EditJobPostingForm";

export default async function EditarVacantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  const { id } = await params;
  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id },
    include: { company: { select: { userId: true } } },
  });
  if (!jobPosting || jobPosting.company.userId !== session.user.id) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Link href={`/vacantes/${jobPosting.id}/aplicantes`} className="text-sm font-medium text-navy-800/60">
          ← Volver
        </Link>
        <h1 className="mt-2 text-lg font-extrabold text-navy-900">Editar vacante</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Los cambios se ven de inmediato para quien vea la vacante.
        </p>
        <div className="mt-5">
          <EditJobPostingForm
            jobId={jobPosting.id}
            defaultValues={{
              title: jobPosting.title,
              description: jobPosting.description,
              laborCategory: jobPosting.laborCategory,
              location: jobPosting.location,
              contractType: jobPosting.contractType,
              quantity: jobPosting.quantity ?? undefined,
              salary: jobPosting.salary ?? "",
              schedule: jobPosting.schedule ?? "",
              experienceRequired: jobPosting.experienceRequired ?? "",
              educationRequired: jobPosting.educationRequired ?? "",
              requirements: jobPosting.requirements ?? "",
              whatsapp: jobPosting.whatsapp ?? "",
              contactEmail: jobPosting.contactEmail ?? "",
              deadline: jobPosting.deadline
                ? jobPosting.deadline.toISOString().slice(0, 10)
                : "",
            }}
          />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
