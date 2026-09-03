"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

// Permission priming: en vez de que el navegador tire el pedido nativo de
// permiso (ubicación/cámara/notificaciones) en frío, mostramos primero un
// panel propio explicando para qué es -- la persona entiende el motivo
// antes de que aparezca el diálogo del navegador, en vez de que le salga
// de sorpresa y lo rechace por reflejo.
export function PermissionPrimer({
  icon: Icon,
  title,
  description,
  confirmLabel,
  onConfirm,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  /** Render-prop: recibe `open` para disparar el panel de aviso desde el botón/trigger que ya existía. */
  children: (open: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) return <>{children(() => setOpen(true))}</>;

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-navy-900/10 bg-navy-900/[0.03] p-3.5">
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-navy-800" />
        <div>
          <p className="text-sm font-bold text-navy-900">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-navy-800/60">{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-navy-800/50"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
