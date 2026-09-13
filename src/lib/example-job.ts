export function isExampleCompany(company: { legalId: string }) {
  return company.legalId.startsWith("DEMO_");
}

export const realCompanyFilter = {
  legalId: { not: { startsWith: "DEMO_" } },
} as const;
