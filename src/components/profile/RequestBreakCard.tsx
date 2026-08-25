"use client";

import { useState } from "react";
import { CalendarClock, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { toWhatsappHref } from "@/lib/whatsapp";

export function RequestBreakCard({
  contactName,
  contactWhatsapp,
}: {
  contactName: string;
  contactWhatsapp: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mt-4 p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <CalendarClock className="h-4 w-4 text-navy-700" /> Solicitar descanso/pausa
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-navy-800/40" />
        ) : (
          <ChevronDown className="h-4 w-4 text-navy-800/40" />
        )}
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2.5 rounded-xl border border-sand-200 bg-sand-50 p-3.5">
          <p className="text-xs leading-relaxed text-navy-800/60">
            Para tomarte una pausa, pedile autorización directamente a la persona a cargo de la app.
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-bold text-navy-900">{contactName}</p>
            <p className="flex items-center gap-1.5 text-navy-800/70">
              <Phone className="h-3.5 w-3.5" /> {contactWhatsapp}
            </p>
          </div>
          <a
            href={toWhatsappHref(
              contactWhatsapp,
              "Hola, soy moderador de El Tico Bretea y quiero pedir autorización para tomarme un descanso."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-success-600 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Escribir por WhatsApp
          </a>
        </div>
      )}
    </Card>
  );
}
