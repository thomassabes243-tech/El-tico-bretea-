import { prisma } from "@/lib/prisma";

// Sistema de confianza de empleador (punto 5 del audit de seguridad):
// semáforo simple a partir de señales objetivas ya existentes en la base --
// nunca un puntaje inventado ni una verificación de identidad real (eso
// sigue siendo manual, ver /admin/empresas). El objetivo es hacer visible,
// en un vistazo, lo que hoy hay que buscar a mano en varias pantallas.
export type TrustLevel = "VERDE" | "AMARILLO" | "ROJO";
export type TrustSignal = { label: string };
export type RiskFactor = { label: string };
export type EmployerTrustProfile = {
  level: TrustLevel;
  signals: TrustSignal[];
  risks: RiskFactor[];
};

const ACCOUNT_AGE_TRUST_DAYS = 30;

export async function getEmployerTrustProfile(company: {
  userId: string;
  isVerified: boolean;
  createdAt: Date;
  website: string | null;
  description: string | null;
  contactPhone: string | null;
}): Promise<EmployerTrustProfile> {
  const [graveReports, paymentReports] = await Promise.all([
    prisma.report.count({ where: { targetId: company.userId, severity: "GRAVE" } }),
    prisma.report.count({ where: { targetId: company.userId, reasonCategory: "PAGO_ADELANTADO" } }),
  ]);

  const ageDays = (Date.now() - company.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const isNew = ageDays < ACCOUNT_AGE_TRUST_DAYS;

  const signals: TrustSignal[] = [];
  if (company.isVerified) signals.push({ label: "Empresa verificada por El Mexa Chamba" });
  if (!isNew) {
    signals.push({
      label: `En la plataforma desde ${company.createdAt.toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      })}`,
    });
  }
  if (company.website) signals.push({ label: "Sitio web propio proporcionado" });
  if (company.description) signals.push({ label: "Perfil completo, con descripción de la empresa" });
  if (company.contactPhone) signals.push({ label: "Teléfono de contacto visible" });

  const risks: RiskFactor[] = [];
  if (paymentReports > 0) {
    risks.push({ label: `${paymentReports} reporte${paymentReports > 1 ? "s" : ""} por pedir pago o depósito por adelantado` });
  }
  if (graveReports > 0) {
    risks.push({ label: `${graveReports} reporte${graveReports > 1 ? "s" : ""} grave${graveReports > 1 ? "s" : ""} de seguridad` });
  }
  if (!company.isVerified) risks.push({ label: "Todavía sin verificar por El Mexa Chamba" });
  if (isNew) risks.push({ label: "Cuenta creada hace menos de un mes" });

  let level: TrustLevel = "VERDE";
  if (graveReports > 0 || paymentReports > 0) level = "ROJO";
  else if (!company.isVerified || isNew) level = "AMARILLO";

  return { level, signals, risks };
}
