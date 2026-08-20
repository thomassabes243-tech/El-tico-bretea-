"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { MessageCircle, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, TextInput } from "@/components/forms/FormField";

// Alternativa liviana al login completo, solo para poder escribir en el
// chat de comunidad: pide correo + alias, sin contraseña. Por dentro crea
// una cuenta real e inicia sesión con una contraseña generada en el
// navegador que la persona nunca ve -- ver /api/comunidad/acceso-rapido.
export function QuickChatAccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const password = `${crypto.randomUUID()}${crypto.randomUUID()}`;
      const res = await fetch("/api/comunidad/acceso-rapido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, alias, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo continuar");
      }
      const signInResult = await signIn("credentials", { email, password, redirect: false });
      if (signInResult?.error) throw new Error("No se pudo entrar. Probá de nuevo.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mx-4 mt-6 flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-navy-700" />
        <h2 className="text-sm font-bold text-navy-900">Identificate para escribir acá</h2>
      </div>
      <div className="flex items-start gap-2 rounded-xl border border-navy-700/15 bg-navy-900/[0.03] p-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-navy-700" />
        <p className="text-xs leading-relaxed text-navy-800/70">
          Pedimos un correo para poder identificar a cada persona y silenciarla si insulta o
          abusa. No hace falta contraseña, y elegís vos con qué alias te ven los demás.
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <FieldWrapper label="Correo" htmlFor="quick-email" required>
          <TextInput
            id="quick-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </FieldWrapper>
        <FieldWrapper
          label="Alias"
          htmlFor="quick-alias"
          required
          hint="Así te van a ver los demás en el chat"
        >
          <TextInput
            id="quick-alias"
            required
            maxLength={40}
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Ej. Trabajador de Guadalajara"
          />
        </FieldWrapper>
        {error && <p className="text-xs font-medium text-mx-red-600">{error}</p>}
        <Button type="submit" disabled={busy} fullWidth>
          {busy ? "Entrando..." : "Entrar a la sala"}
        </Button>
      </form>
    </Card>
  );
}
