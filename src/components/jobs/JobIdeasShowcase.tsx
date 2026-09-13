import { BriefcaseBusiness, ChevronRight, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TagChip } from "@/components/ui/Badge";

const JOB_IDEAS = [
  {
    title: "Ayudante de construcción",
    area: "Construcción",
    location: "Gran Área Metropolitana",
    detail: "Apoyo en obra, manejo de materiales, orden y limpieza del área de trabajo.",
  },
  {
    title: "Dependiente de tienda",
    area: "Ventas y comercio",
    location: "San José y alrededores",
    detail: "Atención al público, acomodo de productos, inventario básico y apoyo en caja.",
  },
  {
    title: "Auxiliar de limpieza",
    area: "Limpieza",
    location: "Distintas zonas del país",
    detail: "Limpieza y desinfección de oficinas, comercios, condominios o espacios comunes.",
  },
  {
    title: "Salonero o salonera",
    area: "Restaurantes",
    location: "Zonas comerciales y turísticas",
    detail: "Servicio de mesas, toma de pedidos y apoyo para brindar una buena atención.",
  },
  {
    title: "Chofer de reparto",
    area: "Transporte",
    location: "Rutas locales",
    detail: "Entrega de pedidos, revisión de rutas y cuidado básico de la mercadería asignada.",
  },
  {
    title: "Recepcionista",
    area: "Oficinas y turismo",
    location: "Hoteles, clínicas y oficinas",
    detail: "Atención presencial y telefónica, coordinación de citas y registro de información.",
  },
] as const;

export function JobIdeasShowcase() {
  return (
    <section className="mt-8" aria-labelledby="job-ideas-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="job-ideas-title" className="text-base font-bold text-navy-900">Puestos que podés encontrar</h2>
          <p className="mt-1 text-xs leading-relaxed text-navy-800/55">
            Referencias de puestos; no son vacantes activas ni reciben postulaciones.
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex snap-x gap-3 overflow-x-auto pb-2 scrollbar-none">
        {JOB_IDEAS.map((job) => (
          <Card key={job.title} className="w-[82%] shrink-0 snap-start p-4 sm:w-[72%]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900/[0.07] text-navy-800">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-sm font-bold text-navy-900">{job.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-navy-800/65">{job.detail}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <TagChip>{job.area}</TagChip>
              <TagChip icon={<MapPin className="h-3 w-3" />}>{job.location}</TagChip>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-3 flex items-center gap-3 border-cr-red-600/15 bg-cr-red-100/40 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy-900">¿Tu empresa está contratando?</p>
          <p className="mt-0.5 text-xs text-navy-800/60">Publicá el puesto y empezá a recibir candidatos.</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-cr-red-600" />
      </Card>
      <Button href="/registro/empresa" variant="secondary" fullWidth className="mt-3">
        Publicar una vacante
      </Button>
    </section>
  );
}
