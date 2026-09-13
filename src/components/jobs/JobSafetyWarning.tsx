import { ShieldAlert } from "lucide-react";

export function JobSafetyWarning({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-labelledby={compact ? "job-safety-title-compact" : "job-safety-title"}
      className={`rounded-2xl border border-cr-red-600/20 bg-cr-red-100/50 ${compact ? "p-3.5" : "p-4"}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cr-red-600 text-white">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id={compact ? "job-safety-title-compact" : "job-safety-title"}
            className="font-heading text-sm font-bold text-navy-900"
          >
            ¡Cuidado con las falsas ofertas!
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-navy-800/75">
            Si te piden dinero por uniformes, permisos, exámenes, capacitaciones o para
            reservar una vacante, no pagués. Puede ser una estafa.
          </p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-navy-900">
            Verificá la empresa, no entregués documentos originales ni compartás códigos de
            seguridad. Reportá cualquier publicación sospechosa.
          </p>
        </div>
      </div>
    </aside>
  );
}
