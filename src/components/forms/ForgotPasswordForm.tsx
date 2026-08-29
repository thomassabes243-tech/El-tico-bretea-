"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LogIn } from "lucide-react";
import { FieldWrapper, TextInput } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import {
  forgotPasswordRequestSchema,
  resetPasswordSchema,
  type ForgotPasswordRequestInput,
  type ResetPasswordInput,
} from "@/lib/validations";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"solicitar" | "restablecer">("solicitar");
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestForm = useForm<ForgotPasswordRequestInput>({
    resolver: zodResolver(forgotPasswordRequestSchema),
  });
  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onRequestSubmit = async (data: ForgotPasswordRequestInput) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/olvide-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(responseBody.error || "No se pudo enviar el código");
        return;
      }
      setEmail(data.email);
      resetForm.setValue("email", data.email);
      setStep("restablecer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordInput) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/restablecer-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(responseBody.error || "No se pudo restablecer la contraseña");
        return;
      }
      router.push("/iniciar-sesion");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "solicitar") {
    return (
      <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="flex flex-col gap-4">
        <FieldWrapper
          label="Correo electrónico"
          htmlFor="email"
          required
          error={requestForm.formState.errors.email?.message}
        >
          <TextInput id="email" type="email" placeholder="tu@correo.com" {...requestForm.register("email")} />
        </FieldWrapper>

        {submitError && (
          <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
            {submitError}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar código"} <KeyRound className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="flex flex-col gap-4">
      <p className="text-xs text-navy-800/60">
        Te mandamos un código a <strong className="text-navy-900">{email}</strong>. Vence en 15
        minutos.
      </p>
      <input type="hidden" {...resetForm.register("email")} />

      <FieldWrapper label="Código" htmlFor="code" required error={resetForm.formState.errors.code?.message}>
        <TextInput
          id="code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          {...resetForm.register("code")}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Contraseña nueva"
        htmlFor="password"
        required
        error={resetForm.formState.errors.password?.message}
      >
        <TextInput id="password" type="password" placeholder="••••••••" {...resetForm.register("password")} />
      </FieldWrapper>

      {submitError && (
        <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
          {submitError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : "Cambiar contraseña"} <LogIn className="h-4 w-4" />
      </Button>

      <button
        type="button"
        onClick={() => setStep("solicitar")}
        className="text-center text-xs font-semibold text-navy-800/50"
      >
        Pedir otro código
      </button>
    </form>
  );
}
