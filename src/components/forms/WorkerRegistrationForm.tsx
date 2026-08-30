"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { ChevronLeft, ChevronRight, Info, Plus, Trash2, CheckCircle2 } from "lucide-react";
import {
  workerRegistrationSchema,
  type WorkerRegistrationInput,
  type WorkerRegistrationFormValues,
} from "@/lib/validations";
import { LABOR_CATEGORIES, JOB_TYPES, AVAILABILITY_OPTIONS } from "@/lib/constants";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/forms/FormField";
import { OptionalFormNotice } from "@/components/forms/OptionalFormNotice";
import { WhyWeAskEmailScreen } from "@/components/forms/WhyWeAskEmailScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";

const STEPS: { title: string; fields: (keyof WorkerRegistrationFormValues)[] }[] = [
  { title: "Cuenta", fields: ["email", "password"] },
  { title: "Identidad", fields: ["fullName", "age", "residence", "phone", "whatsapp"] },
  { title: "Profesión", fields: ["profession", "laborCategory", "yearsExperience", "workExperience", "companiesWorkedAt", "previousPositions"] },
  { title: "Estudios y habilidades", fields: ["education", "degrees", "courses", "certifications", "skills", "languages"] },
  { title: "Disponibilidad", fields: ["availability", "willingToRelocate", "jobTypeSought", "salaryExpectation"] },
  { title: "Referencias", fields: ["references"] },
];

export function WorkerRegistrationForm() {
  const router = useRouter();
  const [showEmailIntro, setShowEmailIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<WorkerRegistrationFormValues, unknown, WorkerRegistrationInput>({
    resolver: zodResolver(workerRegistrationSchema),
    defaultValues: {
      willingToRelocate: false,
      references: [],
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "references" });

  const isLastStep = step === STEPS.length - 1;

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const goToEnd = () => setStep(STEPS.length - 1);

  const onSubmit = async (data: WorkerRegistrationInput) => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const deviceFingerprint = await getDeviceFingerprint().catch(() => "");
      const res = await fetch("/api/registro/trabajador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, deviceFingerprint }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo completar el registro");
      }
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signInResult?.error) {
        router.push("/iniciar-sesion");
        return;
      }
      router.push("/perfil");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showEmailIntro) {
    return <WhyWeAskEmailScreen onContinue={() => setShowEmailIntro(false)} />;
  }

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

      {step === 0 ? (
        <OptionalFormNotice>
          Correo y contraseña son los únicos datos obligatorios para crear tu cuenta. Todo lo
          demás en los siguientes pasos es opcional — completalo ahora o dejalo para después.
        </OptionalFormNotice>
      ) : (
        <OptionalFormNotice>
          Esta sección es opcional. Completá solo lo que quieras o tocá «Omitir» para terminar
          el registro ahora mismo.
        </OptionalFormNotice>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <FieldWrapper label="Correo electrónico" htmlFor="email" required error={errors.email?.message}>
            <TextInput id="email" type="email" placeholder="tu@correo.com" {...register("email")} />
          </FieldWrapper>
          <FieldWrapper label="Contraseña" htmlFor="password" required error={errors.password?.message} hint="Mínimo 8 caracteres">
            <TextInput id="password" type="password" placeholder="••••••••" {...register("password")} />
          </FieldWrapper>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <FieldWrapper label="Nombre completo" htmlFor="fullName" error={errors.fullName?.message}>
            <TextInput id="fullName" placeholder="Ej. Juan Pérez Rojas" {...register("fullName")} />
          </FieldWrapper>
          <p className="text-xs text-navy-800/50">
            Después de crear tu cuenta vas a poder subir tu foto desde el teléfono, en «Editar perfil».
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrapper label="Edad" htmlFor="age" error={errors.age?.message}>
              <TextInput id="age" type="number" min={15} max={100} {...register("age")} />
            </FieldWrapper>
            <FieldWrapper label="Residencia" htmlFor="residence" error={errors.residence?.message}>
              <TextInput id="residence" placeholder="Ej. Ciudad de México" {...register("residence")} />
            </FieldWrapper>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldWrapper label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
              <TextInput id="phone" placeholder="55 1234 5678" {...register("phone")} />
            </FieldWrapper>
            <FieldWrapper label="WhatsApp" htmlFor="whatsapp" error={errors.whatsapp?.message}>
              <TextInput id="whatsapp" placeholder="55 1234 5678" {...register("whatsapp")} />
            </FieldWrapper>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <FieldWrapper label="Profesión" htmlFor="profession" error={errors.profession?.message}>
            <TextInput id="profession" placeholder="Ej. Electricista" {...register("profession")} />
          </FieldWrapper>
          <FieldWrapper label="Categoría laboral" htmlFor="laborCategory" error={errors.laborCategory?.message}>
            <Select id="laborCategory" {...register("laborCategory")}>
              <option value="">Seleccioná una categoría</option>
              {LABOR_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Años de experiencia" htmlFor="yearsExperience" error={errors.yearsExperience?.message}>
            <TextInput id="yearsExperience" type="number" min={0} max={60} {...register("yearsExperience")} />
          </FieldWrapper>
          <FieldWrapper label="Experiencia laboral" htmlFor="workExperience" error={errors.workExperience?.message}>
            <Textarea id="workExperience" placeholder="Contanos brevemente en qué has trabajado" {...register("workExperience")} />
          </FieldWrapper>
          <FieldWrapper label="Empresas donde trabajó" htmlFor="companiesWorkedAt" error={errors.companiesWorkedAt?.message}>
            <TextInput id="companiesWorkedAt" placeholder="Separadas por coma" {...register("companiesWorkedAt")} />
          </FieldWrapper>
          <FieldWrapper label="Puestos anteriores" htmlFor="previousPositions" error={errors.previousPositions?.message}>
            <TextInput id="previousPositions" placeholder="Separados por coma" {...register("previousPositions")} />
          </FieldWrapper>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <FieldWrapper label="Estudios" htmlFor="education" error={errors.education?.message}>
            <TextInput id="education" placeholder="Ej. Secundaria completa" {...register("education")} />
          </FieldWrapper>
          <FieldWrapper label="Títulos" htmlFor="degrees" error={errors.degrees?.message}>
            <TextInput id="degrees" placeholder="Ej. Técnico en electricidad" {...register("degrees")} />
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
            <TextInput id="languages" placeholder="Ej. Español, Inglés básico" {...register("languages")} />
          </FieldWrapper>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <FieldWrapper label="Disponibilidad" htmlFor="availability" error={errors.availability?.message}>
            <Select id="availability" {...register("availability")}>
              <option value="">Seleccioná una opción</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Tipo de trabajo que busca" htmlFor="jobTypeSought" error={errors.jobTypeSought?.message}>
            <Select id="jobTypeSought" {...register("jobTypeSought")}>
              <option value="">Seleccioná una opción</option>
              {JOB_TYPES.map((j) => (
                <option key={j.value} value={j.value}>{j.label}</option>
              ))}
            </Select>
          </FieldWrapper>
          <label className="flex items-center gap-2.5 text-sm font-medium text-navy-900">
            <input type="checkbox" className="h-4.5 w-4.5 rounded border-sand-200 text-mx-red-600" {...register("willingToRelocate")} />
            Disponible para trasladarme de lugar de trabajo
          </label>
          <FieldWrapper label="Expectativa salarial" htmlFor="salaryExpectation" hint="Este dato es privado por defecto." error={errors.salaryExpectation?.message}>
            <TextInput id="salaryExpectation" placeholder="Ej. $350,000 mensuales" {...register("salaryExpectation")} />
          </FieldWrapper>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-4">
          {fields.length === 0 && (
            <p className="text-sm text-navy-800/60">
              Las referencias son opcionales. Podés agregar hasta 5, o continuar sin ninguna.
            </p>
          )}
          {fields.map((field, index) => (
            <Card key={field.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-navy-900">Referencia {index + 1}</p>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-navy-800/40 hover:text-mx-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
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
            </Card>
          ))}
          {fields.length < 5 && (
            <button
              type="button"
              onClick={() => append({ name: "", company: "", phone: "", email: "" })}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-sand-200 py-3 text-sm font-semibold text-navy-800/60 hover:border-navy-700/40 hover:text-navy-800"
            >
              <Plus className="h-4 w-4" /> Agregar otra referencia
            </button>
          )}

          <Card className="flex gap-2.5 border-navy-700/15 bg-navy-900/[0.03] p-3.5">
            <Info className="h-4 w-4 shrink-0 text-navy-700" />
            <p className="text-xs leading-relaxed text-navy-800/70">
              No solicitamos carta de antecedentes penales ni documentos similares. Si una
              empresa lo necesita, eso queda como un acuerdo directo y privado entre vos y
              ella, fuera de la app.
            </p>
          </Card>
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
          {/* key distinto en cada rama: sin esto React reusa el mismo nodo
              <button> y solo le cambia el atributo type de "button" a
              "submit" al llegar al último paso -- si ese cambio de type
              ocurre mientras el navegador todavía está resolviendo el click
              que lo disparó (goNext es async), ESE MISMO click termina
              enviando el formulario de una, salteando el paso de
              Referencias por completo (bug real, confirmado con Playwright:
              crear la cuenta sin que el botón "Crear mi cuenta" se haya
              tocado nunca). Con key distinto, React desmonta y crea un
              <button> nuevo en vez de mutar el que ya existía. */}
          {!isLastStep ? (
            <Button key="continue" type="button" onClick={goNext} fullWidth>
              Continuar <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button key="submit" type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Crear mi cuenta"} <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {step > 0 && !isLastStep && (
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
