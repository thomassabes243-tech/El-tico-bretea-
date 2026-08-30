"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, ImagePlus, CheckCircle2, ArrowLeft, X } from "lucide-react";
import {
  jobPostingSchema,
  type JobPostingInput,
  type JobPostingFormValues,
} from "@/lib/validations";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Phase = "pegar" | "revisar" | "publicado";

export function ImportarOfertaForm() {
  const [phase, setPhase] = useState<Phase>("pegar");
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobPostingFormValues, unknown, JobPostingInput>({
    resolver: zodResolver(jobPostingSchema),
    mode: "onTouched",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSelectImage = (file: File | null) => {
    setImage(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const analizar = async () => {
    if (!text.trim() && !image) {
      setAnalyzeError("Pegá el texto de la publicación o subí una imagen");
      return;
    }
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const formData = new FormData();
      formData.append("text", text);
      if (image) formData.append("image", image);

      const res = await fetch("/api/admin/importar-oferta/analizar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo analizar la publicación");
      }
      const extracted = await res.json();
      reset({
        title: extracted.title ?? "",
        description: extracted.description ?? "",
        laborCategory: extracted.laborCategory ?? undefined,
        location: extracted.location ?? "",
        contractType: undefined,
        whatsapp: extracted.whatsapp ?? "",
      });
      setPhase("revisar");
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setAnalyzing(false);
    }
  };

  const onSubmit = async (data: JobPostingInput) => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/importar-oferta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo publicar la oferta");
      }
      const { id } = await res.json();
      setPublishedId(id);
      setPhase("publicado");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (phase === "publicado") {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-success-600" />
        <p className="text-sm font-semibold text-navy-900">Oferta publicada</p>
        <p className="text-xs text-navy-800/60">
          Ya está en el mismo listado que las vacantes publicadas normalmente.
        </p>
        <div className="mt-2 flex gap-2">
          {publishedId && (
            <Button href={`/vacantes/${publishedId}`} size="sm" variant="outline">
              Ver oferta
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setPhase("pegar");
              setText("");
              onSelectImage(null);
              setPublishedId(null);
              reset({});
            }}
          >
            Importar otra
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === "revisar") {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Card className="flex items-start gap-2.5 border-peso-600/20 bg-peso-100/40 p-3.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-peso-600" />
          <p className="text-xs leading-relaxed text-navy-800/70">
            La IA completó lo que pudo identificar. Revisá y corregí antes de publicar --
            los campos vacíos no se pudieron determinar del texto/imagen.
          </p>
        </Card>

        <FieldWrapper label="Puesto" htmlFor="title" error={errors.title?.message}>
          <TextInput id="title" placeholder="Ej. Ayudante de construcción" {...register("title")} />
        </FieldWrapper>
        <FieldWrapper label="Descripción" htmlFor="description" error={errors.description?.message}>
          <Textarea id="description" placeholder="Describí las funciones del puesto" {...register("description")} />
        </FieldWrapper>
        <FieldWrapper label="Categoría" htmlFor="laborCategory" error={errors.laborCategory?.message}>
          <Select id="laborCategory" {...register("laborCategory")}>
            <option value="">Seleccioná una categoría</option>
            {LABOR_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </FieldWrapper>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrapper label="Ubicación" htmlFor="location" error={errors.location?.message}>
            <TextInput id="location" placeholder="Ej. Guadalajara, Jalisco" {...register("location")} />
          </FieldWrapper>
          <FieldWrapper label="Tipo de contrato" htmlFor="contractType" error={errors.contractType?.message}>
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
            <TextInput id="salary" placeholder="Ej. $8,000 - $10,000" {...register("salary")} />
          </FieldWrapper>
        </div>
        <FieldWrapper label="Horario" htmlFor="schedule" error={errors.schedule?.message}>
          <TextInput id="schedule" placeholder="Ej. Lunes a sábado, 7am - 4pm" {...register("schedule")} />
        </FieldWrapper>
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
        <FieldWrapper label="Fecha límite" htmlFor="deadline" error={errors.deadline?.message}>
          <TextInput id="deadline" type="date" {...register("deadline")} />
        </FieldWrapper>

        {submitError && (
          <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
            {submitError}
          </p>
        )}

        <div className="flex gap-2.5">
          <Button type="button" variant="outline" onClick={() => setPhase("pegar")}>
            <ArrowLeft className="h-4 w-4" /> Editar entrada
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Publicando..." : "Publicar oferta"} <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2 p-4">
        <label className="text-sm font-semibold text-navy-900" htmlFor="import-text">
          Pegá aquí el texto de la publicación
        </label>
        <Textarea
          id="import-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder='Ej. "Se necesita albañil para trabajar en Guadalajara. Experiencia mínima de 2 años. Salario según experiencia. Interesados escribir al 55 1234 5678."'
        />
      </Card>

      <Card className="flex flex-col gap-2.5 p-4">
        <p className="text-sm font-semibold text-navy-900">Imagen (opcional)</p>
        <p className="text-xs text-navy-800/50">
          Una captura de pantalla o foto del cartel/publicación. Se puede usar junto con el texto.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onSelectImage(e.target.files?.[0] ?? null)}
        />
        {imagePreview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local antes de subir, nunca se guarda como archivo estático */}
            <img src={imagePreview} alt="Vista previa" className="max-h-56 w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => onSelectImage(null)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-navy-900/70 text-white"
              aria-label="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-sand-200 text-sm font-semibold text-navy-800/60 hover:border-navy-700/40"
          >
            <ImagePlus className="h-4 w-4" /> Seleccionar foto
          </button>
        )}
      </Card>

      {analyzeError && (
        <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
          {analyzeError}
        </p>
      )}

      <Button type="button" onClick={analizar} disabled={analyzing} fullWidth>
        <Sparkles className="h-4 w-4" /> {analyzing ? "Analizando..." : "Procesar con IA"}
      </Button>
    </div>
  );
}
