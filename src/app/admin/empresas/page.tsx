import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, ShieldX, ExternalLink } from "lucide-react";
import { toggleCompanyVerified } from "./actions";

export default async function AdminEmpresasPage() {
  const companies = await prisma.companyProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { jobPostings: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Empresas</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        {companies.length} empresas registradas. Verificar activa la insignia &ldquo;Empresa
        verificada ✓&rdquo; y las vacantes compartidas como verificadas en el chat.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {companies.map((c) => (
          <Card key={c.id} className="flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-navy-900">
                <span className="truncate">{c.commercialName}</span>
                {c.isVerified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success-600" />}
              </p>
              <p className="truncate text-xs text-navy-800/50">
                {c.activity} · {c.location} · {c._count.jobPostings} vacante{c._count.jobPostings !== 1 ? "s" : ""}
              </p>
              <p className="truncate text-xs text-navy-800/40">{c.contactEmail} · {c.legalId}</p>
            </div>
            <Link href={`/empresas/${c.id}`} target="_blank" className="shrink-0 text-navy-800/40" title="Ver perfil público">
              <ExternalLink className="h-4 w-4" />
            </Link>
            <form
              action={async () => {
                "use server";
                await toggleCompanyVerified(c.id, !c.isVerified);
              }}
            >
              <button
                type="submit"
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                  c.isVerified
                    ? "border-sand-200 text-navy-800/70"
                    : "border-success-600/30 text-success-600"
                }`}
              >
                {c.isVerified ? (
                  <>
                    <ShieldX className="h-3.5 w-3.5" /> Quitar verificación
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" /> Verificar
                  </>
                )}
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
