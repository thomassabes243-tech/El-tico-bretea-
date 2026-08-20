"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Info } from "lucide-react";
import { companyProfileUpdateSchema, type CompanyProfileUpdateInput } from "@/lib/validations";
import { FieldWrapper, TextInput, Textarea } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function EditCompanyProfileForm({
  defaultValues,
  wasVerified,
}: {
  defaultValues: CompanyProfileUpdateInput;
  wasVerified: boolean;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyProfileUpdateInput>({
    resolver: zodResolver(companyProfileUpdateSchema),
    defaultValues,
    mode: "onTouched",
  });

  const currentLegalId = useWatch({ control, name: "legalId" });
  const legalIdChanged = wasVerified && currentLegalId !== defaultValues.legalId;

  const onSubmit = async (data: CompanyProfileUpdateInput) => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/perfil/empresa", {
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldWrapper label="Nombre comercial" htmlFor="commercialName" error={errors.commercialName?.message}>
        <TextInput id="commercialName" {...register("commercialName")} />
      </FieldWrapper>
      <FieldWrapper label="Identificación / RFC" htmlFor="legalId" error={errors.legalId?.message}>
        <TextInput id="legalId" {...register("legalId")} />
      </FieldWrapper>
      {legalIdChanged && (
        <Card className="flex gap-2.5 border-peso-600/25 bg-peso-100/40 p-3.5">
          <Info className="h-4 w-4 shrink-0 text-peso-600" />
          <p className="text-xs leading-relaxed text-navy-800/70">
            Tu empresa está verificada. Si cambiás la identificación legal, se quitará la
            verificación hasta que el equipo la revise de nuevo.
          </p>
        </Card>
      )}
      <FieldWrapper label="Nombre del responsable" htmlFor="responsibleName" error={errors.responsibleName?.message}>
        <TextInput id="responsibleName" {...register("responsibleName")} />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Teléfono de contacto" htmlFor="contactPhone" error={errors.contactPhone?.message}>
          <TextInput id="contactPhone" {...register("contactPhone")} />
        </FieldWrapper>
        <FieldWrapper label="Correo de contacto" htmlFor="contactEmail" error={errors.contactEmail?.message}>
          <TextInput id="contactEmail" type="email" {...register("contactEmail")} />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Ubicación" htmlFor="location" error={errors.location?.message}>
        <TextInput id="location" {...register("location")} />
      </FieldWrapper>
      <FieldWrapper label="Actividad comercial" htmlFor="activity" error={errors.activity?.message}>
        <TextInput id="activity" {...register("activity")} />
      </FieldWrapper>
      <FieldWrapper label="Logo (URL)" htmlFor="logoUrl" error={errors.logoUrl?.message}>
        <TextInput id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
      </FieldWrapper>
      <FieldWrapper label="Descripción" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" {...register("description")} />
      </FieldWrapper>

      <Card className="flex flex-col gap-3 p-4">
        <h2 className="text-sm font-bold text-navy-900">Alias público</h2>
        <p className="text-xs text-navy-800/50">
          Si lo completás, se muestra en las salas de comunidad y en el canal de alertas de
          estafas en vez del nombre comercial. La cuenta sigue siendo la misma por dentro: si
          alguien insulta o abusa, un moderador igual puede identificarla y silenciarla. Dejalo
          vacío para seguir mostrando el nombre comercial.
        </p>
        <FieldWrapper label="Alias" htmlFor="chatAlias" hint="Máximo 40 caracteres" error={errors.chatAlias?.message}>
          <TextInput id="chatAlias" placeholder="Ej. Empresa de limpieza en Guadalajara" {...register("chatAlias")} />
        </FieldWrapper>
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
