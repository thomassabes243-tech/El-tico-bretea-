"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { scamAlertSchema, type ScamAlertInput, type ScamAlertFormValues } from "@/lib/validations";
import { SCAM_ALERT_MODALITIES } from "@/lib/constants";
import { FieldWrapper, TextInput, Textarea, Select } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

export function ScamAlertForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScamAlertFormValues, unknown, ScamAlertInput>({
    resolver: zodResolver(scamAlertSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: ScamAlertInput) => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/alertas-estafa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo publicar la alerta");
      }
      const { id } = await res.json();
      router.push(`/alertas-estafa/${id}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldWrapper
        label="Título"
        htmlFor="title"
        required
        hint="Podés ser directo, ej. «⚠️ Estafa» o «⚠️ Peligro» — no se filtra"
        error={errors.title?.message}
      >
        <TextInput id="title" placeholder="Ej. ⚠️ Estafa: piden depósito para 'materiales'" {...register("title")} />
      </FieldWrapper>
      <FieldWrapper label="Oferta o empresa" htmlFor="offerDescription" required error={errors.offerDescription?.message}>
        <Textarea
          id="offerDescription"
          placeholder="Nombre de la empresa u oferta, dónde la viste, qué puesto ofrecían"
          {...register("offerDescription")}
        />
      </FieldWrapper>
      <FieldWrapper label="Por qué sospechás" htmlFor="suspicionReason" required error={errors.suspicionReason?.message}>
        <Textarea
          id="suspicionReason"
          placeholder="Qué te pareció raro o peligroso: pedían dinero por adelantado, no daban dirección física, etc."
          {...register("suspicionReason")}
        />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Ubicación" htmlFor="location" hint="Opcional" error={errors.location?.message}>
          <TextInput id="location" placeholder="Ej. Guadalajara" {...register("location")} />
        </FieldWrapper>
        <FieldWrapper label="Modalidad" htmlFor="modality" hint="Opcional" error={errors.modality?.message}>
          <Select id="modality" {...register("modality")}>
            <option value="">Sin especificar</option>
            {SCAM_ALERT_MODALITIES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
        </FieldWrapper>
      </div>

      {submitError && (
        <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
          {submitError}
        </p>
      )}

      <Button type="submit" variant="secondary" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Publicando..." : "Publicar alerta"} <AlertTriangle className="h-4 w-4" />
      </Button>
    </form>
  );
}
