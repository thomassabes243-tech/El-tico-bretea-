export function isExampleCompany(company: { legalId: string }) {
  return company.legalId.startsWith("DEMO_");
}

export function isExampleJob(job: { id: string; company: { legalId: string } }) {
  return job.id.startsWith("seed_ejemplo_job_") || isExampleCompany(job.company);
}

export const realJobIdFilter = {
  not: { startsWith: "seed_ejemplo_job_" },
} as const;

export const realCompanyFilter = {
  legalId: { not: { startsWith: "DEMO_" } },
} as const;
