"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";

const STORAGE_KEY = "mexa-chamba:onboarding:v1";

const SLIDES = [
  {
    eyebrow: "Bienvenido a El Mexa Chamba",
    title: "Trabajo y servicios en un solo lugar",
    description:
      "Buscá oportunidades, ofrecé tus servicios y conectá con personas de tu comunidad.",
    image: "/assets/images/hero-worker.jpg",
    tone: "navy",
    Icon: BriefcaseBusiness,
    points: ["Vacantes y servicios", "Perfiles profesionales", "Contacto directo"],
  },
  {
    eyebrow: "Alerta de fraude",
    title: "Una empresa real no debe cobrarte por contratarte",
    description:
      "No deposités dinero por entrevistas, uniformes o capacitaciones. Tampoco entregués datos bancarios ni documentos originales.",
    image: "/assets/images/seguridad-calle.jpg",
    tone: "red",
    Icon: ShieldAlert,
    points: ["No pagués por una vacante", "Verificá quién te contacta", "Reportá solicitudes sospechosas"],
  },
  {
    eyebrow: "Detectá señales de riesgo",
    title: "Una oferta demasiado urgente puede ser una trampa",
    description:
      "Desconfiá de salarios extraordinarios sin entrevista, empresas ocultas o cambios repentinos de ubicación.",
    image: "/assets/images/quiero-trabajar.jpg",
    tone: "amber",
    Icon: TriangleAlert,
    points: ["Investigá la empresa", "Confirmá lugar y horario", "No aceptés traslados inesperados"],
  },
  {
    eyebrow: "Modo seguro",
    title: "Tu seguridad siempre va primero",
    description:
      "Avisale a alguien de confianza, compartí tu ubicación y elegí un lugar público para el primer encuentro.",
    image: "/assets/images/seguridad-calle.jpg",
    tone: "green",
    Icon: ShieldCheck,
    points: ["Compartí tu ubicación", "Guardá un contacto de confianza", "Si algo no está bien, retirate y pedí ayuda"],
  },
  {
    eyebrow: "Planes opcionales · próximamente",
    title: "Conseguí más oportunidades",
    description:
      "Usá Mexa Chamba gratis y pagá únicamente cuando quieras obtener mayor visibilidad.",
    image: "/assets/images/servicio-electricista.jpg",
    tone: "purple",
    Icon: Sparkles,
    points: ["Destacá tu perfil o vacante", "Aparecé primero", "Recibí más contactos y herramientas"],
  },
] as const;

const TONE_CLASSES = {
  navy: "from-navy-950/95 via-navy-950/78 to-navy-900/30",
  red: "from-mx-red-700/95 via-navy-950/82 to-navy-950/35",
  amber: "from-[#6f3305]/95 via-navy-950/82 to-navy-950/35",
  green: "from-mx-green-700/95 via-navy-950/80 to-navy-950/30",
  purple: "from-peso-700/95 via-navy-950/82 to-navy-950/30",
} as const;

export function WelcomeExperience({ alwaysOpen = false }: { alwaysOpen?: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const isFirstVisit = useSyncExternalStore(
    () => () => undefined,
    () => {
      try {
        return window.localStorage.getItem(STORAGE_KEY) !== "done";
      } catch {
        return true;
      }
    },
    () => false
  );
  const open = !dismissed && (alwaysOpen || (pathname !== "/bienvenida" && isFirstVisit));

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const Icon = slide.Icon;

  function finish(destination?: string) {
    try {
      window.localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      // La guía también funciona si el navegador bloquea el almacenamiento.
    }
    setDismissed(true);
    if (destination) router.push(destination);
    else if (alwaysOpen) router.push("/");
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-sand-50"
      role="dialog"
      aria-modal="true"
      aria-label={`Bienvenida, paso ${index + 1} de ${SLIDES.length}`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between px-5 py-4">
          <Logo size={38} />
          <button
            type="button"
            onClick={() => finish()}
            className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-navy-800/65 hover:bg-sand-100"
            aria-label="Cerrar bienvenida"
          >
            <X className="h-4 w-4" /> Omitir
          </button>
        </header>

        <main className="flex flex-1 flex-col px-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
          <section className="relative min-h-[330px] flex-1 overflow-hidden rounded-[28px] bg-navy-950 text-white shadow-[0_24px_55px_rgba(6,27,51,0.24)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- imágenes locales ya optimizadas y usadas como fondo decorativo */}
            <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className={clsx("absolute inset-0 bg-gradient-to-r", TONE_CLASSES[slide.tone])} />
            <div className="relative flex h-full min-h-[330px] flex-col justify-end p-6">
              <span className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] backdrop-blur-md">
                <Icon className="h-3.5 w-3.5" /> {slide.eyebrow}
              </span>
              <h1 className="max-w-[94%] text-[30px] font-extrabold leading-[1.05] tracking-[-0.035em]">
                {slide.title}
              </h1>
              <p className="mt-3 text-[14px] leading-relaxed text-white/82">{slide.description}</p>
            </div>
          </section>

          <section className="mx-2 -mt-4 rounded-[22px] border border-sand-200 bg-white p-4 shadow-[0_14px_34px_rgba(10,38,71,0.12)]">
            <ul className="grid gap-2.5">
              {slide.points.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-[13px] font-semibold text-navy-900">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mx-green-600/10 text-mx-green-600">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </section>

          {isLast && (
            <div className="mt-4 rounded-2xl bg-peso-100 px-4 py-3 text-center text-xs font-semibold leading-relaxed text-peso-700">
              Tu próximo cliente o trabajador podría estar buscándote ahora. Los planes aumentan visibilidad, pero no garantizan contrataciones.
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-2" aria-label={`Paso ${index + 1} de ${SLIDES.length}`}>
            {SLIDES.map((item, dotIndex) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setIndex(dotIndex)}
                className={clsx(
                  "h-2.5 rounded-full transition-all",
                  dotIndex === index ? "w-8 bg-mx-red-600" : "w-2.5 bg-sand-200"
                )}
                aria-label={`Ir al paso ${dotIndex + 1}`}
                aria-current={dotIndex === index ? "step" : undefined}
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => setIndex((current) => current - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sand-200 text-navy-900"
                aria-label="Paso anterior"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <span />
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={() => setIndex((current) => current + 1)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-mx-red-600 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(206,17,38,0.25)]"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => finish("/planes")}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-peso-700 to-peso-500 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(74,36,114,0.28)]"
              >
                <Eye className="h-4 w-4" /> Ver planes
              </button>
            )}
          </div>

          {isLast && (
            <button
              type="button"
              onClick={() => finish()}
              className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-navy-800/65 hover:bg-sand-100"
            >
              Continuar gratis <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
