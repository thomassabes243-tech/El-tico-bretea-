"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { FieldWrapper, TextInput } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function IniciarSesionPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setSubmitError(null);
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setIsSubmitting(false);
    if (result?.error) {
      setSubmitError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/perfil");
    router.refresh();
  };

  return (
    <AuthShell title="Iniciá sesión" subtitle="Entrá con tu correo y contraseña.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldWrapper label="Correo electrónico" htmlFor="email" required error={errors.email?.message}>
          <TextInput id="email" type="email" placeholder="tu@correo.com" {...register("email")} />
        </FieldWrapper>
        <FieldWrapper label="Contraseña" htmlFor="password" required error={errors.password?.message}>
          <TextInput id="password" type="password" placeholder="••••••••" {...register("password")} />
        </FieldWrapper>

        {submitError && (
          <p className="rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">
            {submitError}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"} <LogIn className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-800/60">
        ¿Todavía no tenés cuenta?{" "}
        <Link href="/registro" className="font-semibold text-mx-red-600">
          Creá una cuenta
        </Link>
      </p>
    </AuthShell>
  );
}
