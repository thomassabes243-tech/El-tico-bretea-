import { ListChecks } from "lucide-react";
import { Card } from "@/components/ui/Card";

const ITEMS = [
  "Confirmá la dirección exacta antes de salir -- si es raro o cambia de golpe, desconfiá.",
  "Avisale a alguien de confianza dónde vas y a qué hora volvés (podés usar \"Voy a esta entrevista\" abajo).",
  "Nunca pagues nada por adelantado -- ni depósito, ni kit, ni capacitación.",
  "Preferí una primera entrevista en un lugar público (ver Puntos de encuentro seguros).",
  "Si algo se siente mal apenas llegás, no te quedás. Podés irte.",
];

/** Checklist estático de seguridad antes de acudir a una entrevista presencial. */
export function AntesDeAcudirChecklist() {
  return (
    <Card className="p-4">
      <h2 className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
        <ListChecks className="h-4 w-4 text-navy-800/60" /> Antes de acudir
      </h2>
      <ul className="mt-2.5 flex flex-col gap-2">
        {ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-navy-800/70">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-800/30" /> {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
