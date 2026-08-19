"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Plus, Trash2, CheckCircle2 } from "lucide-react";
import {
  workerProfileUpdateSchema,
  type WorkerProfileUpdateInput,
  type WorkerProfileUpdateFormValues,
} from "@/lib/validations";
import { LABOR_CATEGORIES, JOB_TYPES, AVAILABILITY_OPTIONS } from "@/lib/constants";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function EditWorkerProfileForm({
  defaultValues,
}: {
  defaultValues: WorkerProfileUpdateFormValues;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerProfileUpdateFormValues, unknown, WorkerProfileUpdateInput>({
    resolver: zodResolver(workerProfileUpdateSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "references" });

  const onSubmit = async (data: WorkerProfileUpdateInput) => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/perfil/trabajador", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo guardar el perfil");
      }
      router.push("/perfil");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-4">
        <h2 className="text-sm font-bold text-navy-900">Identidad</h2>
        <FieldWrapper label="Nombre completo" htmlFor="fullName" required error={errors.fullName?.message}>
          <TextInput id="fullName" {...register("fullName")} />
        </FieldWrapper>
        <FieldWrapper
          label="Alias"
          htmlFor="alias"
          hint="Opcional. Se muestra en vez de tu nombre solo en el canal de alertas de estafas."
          error={errors.alias?.message}
        >
          <TextInput id="alias" placeholder="Ej. Trabajador_GDL" {...register("alias")} />
        </FieldWrapper>
        <FieldWrapper
          label="Fotografía formal (URL)"
          htmlFor="formalPhotoUrl"
          hint="Podés pegar el enlace de una foto tipo carné."
          error={errors.formalPhotoUrl?.message}
        >
          <TextInput id="formalPhotoUrl" placeholder="https://..." {...register("formalPhotoUrl")} />
        </FieldWrapper>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Edad" htmlFor="age" required error={errors.age?.message}>
            <TextInput id="age" type="number" min={15} max={100} {...register("age")} />
          </FieldWrapper>
          <FieldWrapper label="Residencia" htmlFor="residence" required error={errors.residence?.message}>
            <TextInput id="residence" {...register("residence")} />
          </FieldWrapper>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
            <TextInput id="phone" {...register("phone")} />
          </FieldWrapper>
          <FieldWrapper label="WhatsApp" htmlFor="whatsapp" error={errors.whatsapp?.message}>
            <TextInput id="whatsapp" {...register("whatsapp")} />
          </FieldWrapper>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-4">
        <h2 className="text-sm font-bold text-navy-900">Profesión</h2>
        <FieldWrapper label="Profesión" htmlFor="profession" required error={errors.profession?.message}>
          <TextInput id="profession" {...register("profession")} />
        </FieldWrapper>
        <FieldWrapper label="Categoría laboral" htmlFor="laborCategory" required error={errors.laborCategory?.message}>
          <Select id="laborCategory" {...register("laborCategory")}>
            {LABOR_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Años de experiencia" htmlFor="yearsExperience" required error={errors.yearsExperience?.message}>
          <TextInput id="yearsExperience" type="number" min={0} max={60} {...register("yearsExperience")} />
        </FieldWrapper>
        <FieldWrapper label="Experiencia laboral" htmlFor="workExperience" error={errors.workExperience?.message}>
          <Textarea id="workExperience" {...register("workExperience")} />
        </FieldWrapper>
        <FieldWrapper label="Empresas donde trabajó" htmlFor="companiesWorkedAt" error={errors.companiesWorkedAt?.message}>
          <TextInput id="companiesWorkedAt" placeholder="Separadas por coma" {...register("companiesWorkedAt")} />
        </FieldWrapper>
        <FieldWrapper label="Puestos anteriores" htmlFor="previousPositions" error={errors.previousPositions?.message}>
          <TextInput id="previousPositions" placeholder="Separados por coma" {...register("previousPositions")} />
        </FieldWrapper>
      </Card>

      <Card className="flex flex-col gap-4 p-4">
        <h2 className="text-sm font-bold text-navy-900">Estudios y habilidades</h2>
        <FieldWrapper label="Estudios" htmlFor="education" error={errors.education?.message}>
          <TextInput id="education" {...register("education")} />
        </FieldWrapper>
        <FieldWrapper label="Títulos" htmlFor="degrees" error={errors.degrees?.message}>
          <TextInput id="degrees" {...register("degrees")} />
        </FieldWrapper>
        <FieldWrapper label="Cursos" htmlFor="courses" error={errors.courses?.message}>
          <TextInput id="courses" placeholder="Separados por coma" {...register("courses")} />
        </FieldWrapper>
        <FieldWrapper label="Certificaciones" htmlFor="certifications" error={errors.certifications?.message}>
          <TextInput id="certifications" placeholder="Separadas por coma" {...register("certifications")} />
        </FieldWrapper>
        <FieldWrapper label="Habilidades" htmlFor="skills" error={errors.skills?.message}>
          <TextInput id="skills" placeholder="Separadas por coma" {...register("skills")} />
        </FieldWrapper>
        <FieldWrapper label="Idiomas" htmlFor="languages" error={errors.languages?.message}>
          <TextInput id="languages" {...register("languages")} />
        </FieldWrapper>
      </Card>

      <Card className="flex flex-col gap-4 p-4">
        <h2 className="text-sm font-bold text-navy-900">Disponibilidad</h2>
        <FieldWrapper label="Disponibilidad" htmlFor="availability" required error={errors.availability?.message}>
          <Select id="availability" {...register("availability")}>
            {AVAILABILITY_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Tipo de trabajo que busca" htmlFor="jobTypeSought" required error={errors.jobTypeSought?.message}>
          <Select id="jobTypeSought" {...register("jobTypeSought")}>
            {JOB_TYPES.map((j) => (
              <option key={j.value} value={j.value}>{j.label}</option>
            ))}
          </Select>
        </FieldWrapper>
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-900">
          <input type="checkbox" className="h-4.5 w-4.5 rounded border-sand-200 text-mx-red-600" {...register("willingToRelocate")} />
          Disponible para trasladarme de lugar de trabajo
        </label>
        <FieldWrapper label="Expectativa salarial" htmlFor="salaryExpectation" error={errors.salaryExpectation?.message}>
          <TextInput id="salaryExpectation" placeholder="Ej. $350,000 mensuales" {...register("salaryExpectation")} />
        </FieldWrapper>
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <h2 className="text-sm font-bold text-navy-900">Privacidad del perfil público</h2>
        <p className="text-xs text-navy-800/50">
          Elegí qué datos de contacto se muestran cuando una empresa ve tu perfil público.
          Todo empieza oculto por defecto.
        </p>
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-900">
          <input type="checkbox" className="h-4.5 w-4.5 rounded border-sand-200 text-mx-red-600" {...register("isPublic")} />
          Mostrar mi perfil en búsquedas de empresas
        </label>
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-900">
          <input type="checkbox" className="h-4.5 w-4.5 rounded border-sand-200 text-mx-red-600" {...register("showPhone")} />
          Mostrar mi teléfono
        </label>
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-900">
          <input type="checkbox" className="h-4.5 w-4.5 rounded border-sand-200 text-mx-red-600" {...register("showWhatsapp")} />
          Mostrar mi WhatsApp
        </label>
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-900">
          <input type="checkbox" className="h-4.5 w-4.5 rounded border-sand-200 text-mx-red-600" {...register("showEmail")} />
          Mostrar mi correo
        </label>
        <label className="flex items-center gap-2.5 text-sm font-medium text-navy-900">
          <input type="checkbox" className="h-4.5 w-4.5 rounded border-sand-200 text-mx-red-600" {...register("showSalaryExpectation")} />
          Mostrar mi expectativa salarial
        </label>
      </Card>

      <Card className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900">Referencias laborales</h2>
          {fields.length < 5 && (
            <button
              type="button"
              onClick={() => append({ name: "", company: "", phone: "", email: "" })}
              className="flex items-center gap-1 text-xs font-semibold text-mx-red-600"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar
            </button>
          )}
        </div>
        {fields.length === 0 && (
          <p className="text-sm text-navy-800/60">No tenés referencias agregadas. Son opcionales.</p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-xl border border-sand-200 p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-navy-800/50">Referencia {index + 1}</p>
              <button type="button" onClick={() => remove(index)} className="text-navy-800/40 hover:text-mx-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper label="Nombre" htmlFor={`references.${index}.name`} error={errors.references?.[index]?.name?.message}>
                <TextInput {...register(`references.${index}.name` as const)} />
              </FieldWrapper>
              <FieldWrapper label="Empresa" htmlFor={`references.${index}.company`} error={errors.references?.[index]?.company?.message}>
                <TextInput {...register(`references.${index}.company` as const)} />
              </FieldWrapper>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper label="Teléfono" htmlFor={`references.${index}.phone`} error={errors.references?.[index]?.phone?.message}>
                <TextInput {...register(`references.${index}.phone` as const)} />
              </FieldWrapper>
              <FieldWrapper label="Correo" htmlFor={`references.${index}.email`} error={errors.references?.[index]?.email?.message}>
                <TextInput {...register(`references.${index}.email` as const)} />
              </FieldWrapper>
            </div>
          </div>
        ))}
        <Card className="flex gap-2.5 border-navy-700/15 bg-navy-900/[0.03] p-3.5">
          <Info className="h-4 w-4 shrink-0 text-navy-700" />
          <p className="text-xs leading-relaxed text-navy-800/70">
            No solicitamos carta de antecedentes penales ni documentos similares.
          </p>
        </Card>
      </Card>

      {submitError && (
        <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
          {submitError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Guardar cambios"} <CheckCircle2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
