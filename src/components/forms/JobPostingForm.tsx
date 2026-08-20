"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import {
  jobPostingSchema,
  type JobPostingInput,
  type JobPostingFormValues,
} from "@/lib/validations";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/forms/FormField";
import { OptionalFormNotice } from "@/components/forms/OptionalFormNotice";
import { Button } from "@/components/ui/Button";

const STEPS: { title: string; fields: (keyof JobPostingFormValues)[] }[] = [
  { title: "Información básica", fields: ["title", "laborCategory", "location", "description"] },
  { title: "Detalles del puesto", fields: ["contractType", "quantity", "salary", "schedule", "deadline"] },
  { title: "Requisitos y contacto", fields: ["experienceRequired", "educationRequired", "requirements", "whatsapp", "contactEmail"] },
];

export function JobPostingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<JobPostingFormValues, unknown, JobPostingInput>({
    resolver: zodResolver(jobPostingSchema),
    mode: "onTouched",
  });

  const isLastStep = step === STEPS.length - 1;

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const goToEnd = () => setStep(STEPS.length - 1);

  const onSubmit = async (data: JobPostingInput) => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/vacantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo publicar la vacante");
      }
      const { id } = await res.json();
      router.push(`/vacantes/${id}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isLastStep) e.preventDefault();
      }}
    >
      {/* Indicador de pasos */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-mx-red-600" : "bg-sand-200"
            }`}
          />
        ))}
      </div>
      <p className="-mt-3 text-xs font-semibold uppercase tracking-wide text-navy-800/50">
        Paso {step + 1} de {STEPS.length} · {STEPS[step].title}
      </p>

      <OptionalFormNotice>
        Todos los campos de este formulario son opcionales. Completá solo lo que quieras o
        tocá «Omitir» para publicar la vacante ahora mismo.
      </OptionalFormNotice>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <FieldWrapper label="Puesto" htmlFor="title" error={errors.title?.message}>
            <TextInput id="title" placeholder="Ej. Ayudante de construcción" {...register("title")} />
          </FieldWrapper>
          <FieldWrapper label="Categoría" htmlFor="laborCategory" error={errors.laborCategory?.message}>
            <Select id="laborCategory" {...register("laborCategory")}>
              <option value="">Seleccioná una categoría</option>
              {LABOR_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Ubicación" htmlFor="location" error={errors.location?.message}>
            <TextInput id="location" placeholder="Ej. Guadalajara o 'Remoto'" {...register("location")} />
          </FieldWrapper>
          <FieldWrapper label="Descripción del puesto" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" placeholder="Describí las funciones del puesto" {...register("description")} />
          </FieldWrapper>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <FieldWrapper label="Tipo de contrato" htmlFor="contractType" error={errors.contractType?.message}>
            <Select id="contractType" {...register("contractType")}>
              <option value="">Seleccioná</option>
              {JOB_TYPES.map((j) => (
                <option key={j.value} value={j.value}>{j.label}</option>
              ))}
            </Select>
          </FieldWrapper>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrapper label="Cantidad de puestos" htmlFor="quantity" error={errors.quantity?.message}>
              <TextInput id="quantity" type="number" min={1} max={999} {...register("quantity")} />
            </FieldWrapper>
            <FieldWrapper label="Salario" htmlFor="salary" error={errors.salary?.message}>
              <TextInput id="salary" placeholder="Ej. $350,000 - $400,000" {...register("salary")} />
            </FieldWrapper>
          </div>
          <FieldWrapper label="Horario" htmlFor="schedule" error={errors.schedule?.message}>
            <TextInput id="schedule" placeholder="Ej. Lunes a sábado, 7am - 4pm" {...register("schedule")} />
          </FieldWrapper>
          <FieldWrapper label="Fecha límite" htmlFor="deadline" error={errors.deadline?.message}>
            <TextInput id="deadline" type="date" {...register("deadline")} />
          </FieldWrapper>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldWrapper label="Experiencia requerida" htmlFor="experienceRequired" error={errors.experienceRequired?.message}>
              <TextInput id="experienceRequired" placeholder="Ej. 1 año" {...register("experienceRequired")} />
            </FieldWrapper>
            <FieldWrapper label="Estudios requeridos" htmlFor="educationRequired" error={errors.educationRequired?.message}>
              <TextInput id="educationRequired" placeholder="Ej. Secundaria completa" {...register("educationRequired")} />
            </FieldWrapper>
          </div>
          <FieldWrapper label="Requisitos adicionales" htmlFor="requirements" error={errors.requirements?.message}>
            <Textarea id="requirements" placeholder="Documentos, certificaciones, etc." {...register("requirements")} />
          </FieldWrapper>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrapper label="WhatsApp de contacto" htmlFor="whatsapp" error={errors.whatsapp?.message}>
              <TextInput id="whatsapp" placeholder="55 1234 5678" {...register("whatsapp")} />
            </FieldWrapper>
            <FieldWrapper label="Correo de contacto" htmlFor="contactEmail" error={errors.contactEmail?.message}>
              <TextInput id="contactEmail" type="email" {...register("contactEmail")} />
            </FieldWrapper>
          </div>
        </div>
      )}

      {submitError && (
        <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
          {submitError}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={goBack}>
              <ChevronLeft className="h-4 w-4" /> Atrás
            </Button>
          )}
          {!isLastStep ? (
            <Button type="button" onClick={goNext} fullWidth>
              Siguiente <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar vacante"} <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!isLastStep && (
          <button
            type="button"
            onClick={goToEnd}
            className="text-center text-xs font-semibold text-navy-800/50 hover:text-navy-800"
          >
            Omitir
          </button>
        )}
      </div>
    </form>
  );
}
