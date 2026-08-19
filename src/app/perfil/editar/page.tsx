import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { EditWorkerProfileForm } from "@/components/forms/EditWorkerProfileForm";
import { EditCompanyProfileForm } from "@/components/forms/EditCompanyProfileForm";

export default async function EditarPerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  if (session.user.role === "WORKER") {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      include: { references: true },
    });
    if (!worker) redirect("/registro/trabajador");

    return (
      <div className="flex min-h-full flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
          <h1 className="text-lg font-extrabold text-navy-900">Editar mi perfil</h1>
          <p className="mt-1 text-sm text-navy-800/60">
            Actualizá tus datos cuando quieras. Los cambios se ven de inmediato en tu perfil.
          </p>
          <div className="mt-5">
            <EditWorkerProfileForm
              defaultValues={{
                fullName: worker.fullName,
                alias: worker.alias ?? "",
                formalPhotoUrl: worker.formalPhotoUrl ?? "",
                age: worker.age,
                residence: worker.residence,
                phone: worker.phone ?? "",
                whatsapp: worker.whatsapp ?? "",
                profession: worker.profession,
                laborCategory: worker.laborCategory,
                yearsExperience: worker.yearsExperience,
                workExperience: worker.workExperience ?? "",
                companiesWorkedAt: worker.companiesWorkedAt ?? "",
                previousPositions: worker.previousPositions ?? "",
                education: worker.education ?? "",
                degrees: worker.degrees ?? "",
                courses: worker.courses ?? "",
                certifications: worker.certifications ?? "",
                skills: worker.skills ?? "",
                languages: worker.languages ?? "",
                availability: worker.availability,
                willingToRelocate: worker.willingToRelocate,
                jobTypeSought: worker.jobTypeSought,
                salaryExpectation: worker.salaryExpectation ?? "",
                isPublic: worker.isPublic,
                showPhone: worker.showPhone,
                showWhatsapp: worker.showWhatsapp,
                showEmail: worker.showEmail,
                showSalaryExpectation: worker.showSalaryExpectation,
                references: worker.references.map((r) => ({
                  name: r.name,
                  company: r.company,
                  phone: r.phone ?? "",
                  email: r.email ?? "",
                })),
              }}
            />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (session.user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!company) redirect("/registro/empresa");

    return (
      <div className="flex min-h-full flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
          <h1 className="text-lg font-extrabold text-navy-900">Editar perfil de empresa</h1>
          <p className="mt-1 text-sm text-navy-800/60">
            Actualizá tus datos cuando quieras. Los cambios se ven de inmediato en tu perfil.
          </p>
          <div className="mt-5">
            <EditCompanyProfileForm
              wasVerified={company.isVerified}
              defaultValues={{
                commercialName: company.commercialName,
                alias: company.alias ?? "",
                legalId: company.legalId,
                responsibleName: company.responsibleName,
                contactPhone: company.contactPhone ?? "",
                contactEmail: company.contactEmail,
                location: company.location,
                activity: company.activity,
                logoUrl: company.logoUrl ?? "",
                description: company.description ?? "",
              }}
            />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  redirect("/perfil");
}
