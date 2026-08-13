export const JOB_CLOSURE_REASONS = [
  { value: "PUESTO_LLENO", label: "Puesto lleno" },
  { value: "CADUCADA", label: "Búsqueda caducada" },
] as const;

export type JobClosureReasonValue = (typeof JOB_CLOSURE_REASONS)[number]["value"];

export function closureReasonLabel(reason: string | null | undefined): string | null {
  if (!reason) return null;
  return JOB_CLOSURE_REASONS.find((r) => r.value === reason)?.label ?? null;
}
