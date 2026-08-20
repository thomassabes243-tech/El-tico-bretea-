"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
import { companyRegistrationSchema, type CompanyRegistrationInput } from "@/lib/validations";
import { FieldWrapper, TextInput, Textarea } from "@/components/forms/FormField";
import { OptionalFormNotice } from "@/components/forms/OptionalFormNotice";
import { Button } from "@/components/ui/Button";

export function CompanyRegistrationForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyRegistrationInput>({
    resolver: zodResolver(companyRegistrationSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: CompanyRegistrationInput) => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/registro/empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldWrapper label="Correo electrónico" htmlFor="email" required error={errors.email?.message}>
        <TextInput id="email" type="email" placeholder="empresa@correo.com" {...register("email")} />
      </FieldWrapper>
      <FieldWrapper label="Contraseña" htmlFor="password" required error={errors.password?.message} hint="Mínimo 8 caracteres">
        <TextInput id="password" type="password" placeholder="••••••••" {...register("password")} />
      </FieldWrapper>
      <OptionalFormNotice>
        Correo y contraseña son los únicos datos obligatorios. El resto de la información de
        tu empresa es opcional — completala ahora o tocá «Omitir» para crear la cuenta ya
        mismo y completarla después desde tu perfil.
      </OptionalFormNotice>

      <Button
        type="button"
        variant="outline"
        fullWidth
        disabled={isSubmitting}
        onClick={handleSubmit(onSubmit)}
      >
        Omitir
      </Button>

      <FieldWrapper label="Nombre comercial" htmlFor="commercialName" error={errors.commercialName?.message}>
        <TextInput id="commercialName" placeholder="Ej. Constructora ABC" {...register("commercialName")} />
      </FieldWrapper>
      <FieldWrapper label="Identificación / RFC" htmlFor="legalId" error={errors.legalId?.message}>
        <TextInput id="legalId" placeholder="ABC010101AB1" {...register("legalId")} />
      </FieldWrapper>
      <FieldWrapper label="Nombre del responsable" htmlFor="responsibleName" error={errors.responsibleName?.message}>
        <TextInput id="responsibleName" {...register("responsibleName")} />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Teléfono de contacto" htmlFor="contactPhone" error={errors.contactPhone?.message}>
          <TextInput id="contactPhone" placeholder="55 1234 5678" {...register("contactPhone")} />
        </FieldWrapper>
        <FieldWrapper label="Correo de contacto" htmlFor="contactEmail" error={errors.contactEmail?.message}>
          <TextInput id="contactEmail" type="email" {...register("contactEmail")} />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Ubicación" htmlFor="location" error={errors.location?.message}>
        <TextInput id="location" placeholder="Ej. Guadalajara, Jalisco" {...register("location")} />
      </FieldWrapper>
      <FieldWrapper label="Actividad comercial" htmlFor="activity" error={errors.activity?.message}>
        <TextInput id="activity" placeholder="Ej. Construcción y remodelación" {...register("activity")} />
      </FieldWrapper>
      <FieldWrapper label="Logo (URL)" htmlFor="logoUrl" hint="La carga de archivos llega en una próxima entrega." error={errors.logoUrl?.message}>
        <TextInput id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
      </FieldWrapper>
      <FieldWrapper label="Descripción" htmlFor="description" error={errors.description?.message}>
        <Textarea id="description" placeholder="Contanos brevemente sobre la empresa" {...register("description")} />
      </FieldWrapper>

      {submitError && (
        <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
          {submitError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta de empresa"} <CheckCircle2 className="h-4 w-4" />
      </Button>
    </form>
  );
}
