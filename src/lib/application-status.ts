export const APPLICATION_STATUS_OPTIONS = [
  { value: "ENVIADA", label: "Enviada", className: "bg-sand-100 text-navy-800/70", tone: "neutral" },
  { value: "VISTA", label: "Vista", className: "bg-navy-900/[0.08] text-navy-800", tone: "navy" },
  { value: "CONTACTADA", label: "Contactada", className: "bg-success-600/10 text-success-600", tone: "success" },
  { value: "DESCARTADA", label: "Descartada", className: "bg-cr-red-600/10 text-cr-red-600", tone: "red" },
] as const;

export type ApplicationStatusValue = (typeof APPLICATION_STATUS_OPTIONS)[number]["value"];

export function applicationStatusMeta(status: string) {
  return (
    APPLICATION_STATUS_OPTIONS.find((s) => s.value === status) ?? APPLICATION_STATUS_OPTIONS[0]
  );
}
