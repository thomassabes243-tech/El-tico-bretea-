import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Users, Building2, Briefcase, MessagesSquare, Flag, HardDrive } from "lucide-react";

async function getStats() {
  const [
    workerCount,
    companyCount,
    activeJobCount,
    totalJobCount,
    messageCount,
    pendingReports,
    activeFiles,
    unverifiedCompanies,
  ] = await Promise.all([
    prisma.workerProfile.count(),
    prisma.companyProfile.count(),
    prisma.jobPosting.count({ where: { isActive: true } }),
    prisma.jobPosting.count(),
    prisma.chatMessage.count(),
    prisma.report.count({ where: { resolved: false } }),
    prisma.chatFile.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.companyProfile.count({ where: { isVerified: false } }),
  ]);

  return {
    workerCount,
    companyCount,
    activeJobCount,
    totalJobCount,
    messageCount,
    pendingReports,
    activeFiles,
    unverifiedCompanies,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Trabajadores", value: stats.workerCount, icon: Users, href: "/admin/usuarios" },
    { label: "Empresas", value: stats.companyCount, icon: Building2, href: "/admin/empresas" },
    {
      label: "Vacantes activas",
      value: `${stats.activeJobCount} / ${stats.totalJobCount}`,
      icon: Briefcase,
      href: "/admin/vacantes",
    },
    { label: "Mensajes en comunidad", value: stats.messageCount, icon: MessagesSquare, href: "/admin/moderadores" },
    { label: "Reportes pendientes", value: stats.pendingReports, icon: Flag, href: "/admin/reportes" },
    { label: "Archivos activos en chat", value: stats.activeFiles, icon: HardDrive, href: "/admin/almacenamiento" },
  ];

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Resumen</h1>
      <p className="mt-1 text-sm text-navy-800/60">Estado general de la plataforma.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}>
              <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <Icon className="h-5 w-5 text-navy-700" />
                <p className="mt-3 text-2xl font-extrabold text-navy-900">{c.value}</p>
                <p className="text-xs text-navy-800/50">{c.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      {stats.unverifiedCompanies > 0 && (
        <Card className="mt-5 flex items-center gap-3.5 border-mx-red-600/20 bg-mx-red-100/40 p-4">
          <Building2 className="h-5 w-5 shrink-0 text-mx-red-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-navy-900">
              {stats.unverifiedCompanies} empresa{stats.unverifiedCompanies !== 1 ? "s" : ""} sin verificar
            </p>
            <p className="text-xs text-navy-800/50">Revisá sus datos y activá la insignia de verificación.</p>
          </div>
          <Link href="/admin/empresas" className="shrink-0 text-xs font-bold text-mx-red-600">
            Revisar
          </Link>
        </Card>
      )}
    </div>
  );
}
