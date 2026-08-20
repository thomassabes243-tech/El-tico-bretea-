"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  jobPostingSchema,
  type JobPostingInput,
  type JobPostingFormValues,
} from "@/lib/validations";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

export function JobPostingForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobPostingFormValues, unknown, JobPostingInput>({
    resolver: zodResolver(jobPostingSchema),
    mode: "onTouched",
  });

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-wide text-navy-800/40">El brete</p>
        <FieldWrapper label="Puesto" htmlFor="title" required error={errors.title?.message}>
          <TextInput id="title" placeholder="Ej. Ayudante de construcción" {...register("title")} />
        </FieldWrapper>
        <FieldWrapper label="Descripción" htmlFor="description" required error={errors.description?.message}>
          <Textarea id="description" placeholder="Describí las funciones del puesto" {...register("description")} />
        </FieldWrapper>
        <FieldWrapper label="Categoría" htmlFor="laborCategory" required error={errors.laborCategory?.message}>
          <Select id="laborCategory" {...register("laborCategory")}>
            <option value="">Seleccioná una categoría</option>
            {LABOR_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </FieldWrapper>
      </div>

      <div className="flex flex-col gap-4 border-t border-sand-200 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-navy-800/40">Ubicación y contrato</p>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Ubicación" htmlFor="location" required error={errors.location?.message}>
            <TextInput id="location" placeholder="Ej. Cartago" {...register("location")} />
          </FieldWrapper>
          <FieldWrapper label="Tipo de contrato" htmlFor="contractType" required error={errors.contractType?.message}>
            <Select id="contractType" {...register("contractType")}>
              <option value="">Seleccioná</option>
              {JOB_TYPES.map((j) => (
                <option key={j.value} value={j.value}>{j.label}</option>
              ))}
            </Select>
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Cantidad de puestos" htmlFor="quantity" error={errors.quantity?.message}>
            <TextInput id="quantity" type="number" min={1} max={999} {...register("quantity")} />
          </FieldWrapper>
          <FieldWrapper label="Salario" htmlFor="salary" hint="Opcional" error={errors.salary?.message}>
            <TextInput id="salary" placeholder="Ej. ₡350,000 - ₡400,000" {...register("salary")} />
          </FieldWrapper>
        </div>
        <FieldWrapper label="Horario" htmlFor="schedule" error={errors.schedule?.message}>
          <TextInput id="schedule" placeholder="Ej. Lunes a sábado, 7am - 4pm" {...register("schedule")} />
        </FieldWrapper>
      </div>

      <div className="flex flex-col gap-4 border-t border-sand-200 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-navy-800/40">Requisitos</p>
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
      </div>

      <div className="flex flex-col gap-4 border-t border-sand-200 pt-5">
        <p className="text-xs font-bold uppercase tracking-wide text-navy-800/40">Contacto</p>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="WhatsApp de contacto" htmlFor="whatsapp" error={errors.whatsapp?.message}>
            <TextInput id="whatsapp" placeholder="8888-8888" {...register("whatsapp")} />
          </FieldWrapper>
          <FieldWrapper label="Correo de contacto" htmlFor="contactEmail" error={errors.contactEmail?.message}>
            <TextInput id="contactEmail" type="email" {...register("contactEmail")} />
          </FieldWrapper>
        </div>
        <FieldWrapper label="Fecha límite" htmlFor="deadline" error={errors.deadline?.message}>
          <TextInput id="deadline" type="date" {...register("deadline")} />
        </FieldWrapper>
      </div>

      {submitError && (
        <p className="rounded-xl bg-cr-red-100 px-3.5 py-2.5 text-sm font-medium text-cr-red-700">
          {submitError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Publicando..." : "Publicar brete"} <CheckCircle2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
