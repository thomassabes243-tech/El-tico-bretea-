"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { startAuthentication } from "@simplewebauthn/browser";
import { KeyRound, Mail, Smartphone } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { FieldWrapper, TextInput } from "@/components/forms/FormField";
import { Button } from "@/components/ui/Button";

export default function IniciarSesionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/passwordless/solicitar", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "No se pudo enviar el código");
      setStep("code");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo enviar el código");
    } finally {
      setBusy(false);
    }
  }

  async function loginWithCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await signIn("email-code", { email, code, redirect: false });
    setBusy(false);
    if (result?.error) {
      setError("El código es incorrecto o ya venció.");
      return;
    }
    router.push("/perfil?configurar-acceso=1");
    router.refresh();
  }

  async function loginWithPasskey() {
    setBusy(true);
    setError(null);
    try {
      const optionsResponse = await fetch("/api/auth/passkey/entrar/opciones", { method: "POST" });
      if (!optionsResponse.ok) throw new Error("No se pudo iniciar la entrada segura");
      const authentication = await startAuthentication(await optionsResponse.json());
      const verifyResponse = await fetch("/api/auth/passkey/entrar/verificar", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(authentication),
      });
      const verified = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok || !verified.ticket) throw new Error(verified.error || "No se reconoció este celular");
      const result = await signIn("passkey-ticket", { ticket: verified.ticket, redirect: false });
      if (result?.error) throw new Error("No se pudo crear la sesión");
      router.push("/perfil");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo reconocer este celular");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Entrá sin contraseña" subtitle="Usá este celular o recibí un código en tu correo.">
      <button type="button" onClick={loginWithPasskey} disabled={busy} className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-navy-900 text-sm font-bold text-white shadow-[0_10px_24px_rgba(10,38,71,0.22)]">
        <Smartphone className="h-5 w-5" /> Entrar con este celular
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-navy-800/35">
        <span className="h-px flex-1 bg-sand-200" /> o con correo <span className="h-px flex-1 bg-sand-200" />
      </div>

      {step === "email" ? (
        <form onSubmit={requestCode} className="flex flex-col gap-4">
          <FieldWrapper label="Correo electrónico" htmlFor="email" required>
            <TextInput id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required />
          </FieldWrapper>
          <Button type="submit" fullWidth disabled={busy}><Mail className="h-4 w-4" /> {busy ? "Enviando…" : "Enviarme un código"}</Button>
        </form>
      ) : (
        <form onSubmit={loginWithCode} className="flex flex-col gap-4">
          <p className="rounded-xl bg-mx-green-600/[0.07] px-4 py-3 text-xs text-navy-800/70">Enviamos un código de seis dígitos a <strong>{email}</strong>.</p>
          <FieldWrapper label="Código de acceso" htmlFor="code" required>
            <TextInput id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" required />
          </FieldWrapper>
          <Button type="submit" fullWidth disabled={busy || code.length !== 6}><KeyRound className="h-4 w-4" /> {busy ? "Verificando…" : "Entrar"}</Button>
          <button type="button" onClick={() => { setStep("email"); setCode(""); }} className="text-xs font-semibold text-navy-800/55">Usar otro correo</button>
        </form>
      )}

      {error && <p className="mt-4 rounded-xl bg-mx-red-100 px-3.5 py-2.5 text-sm font-medium text-mx-red-700">{error}</p>}
      <p className="mt-6 text-center text-sm text-navy-800/60">¿Todavía no tenés cuenta? <Link href="/registro" className="font-semibold text-mx-red-600">Creá una cuenta</Link></p>
    </AuthShell>
  );
}
