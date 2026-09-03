"use client";

import { useTransition } from "react";
import { KeyRound } from "lucide-react";
import { resetUserPassword } from "@/app/admin/usuarios/actions";

export function ResetPasswordButton({ userId, email }: { userId: string; email: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`¿Generar una contraseña nueva para ${email}? La anterior deja de funcionar.`)) return;
        startTransition(async () => {
          const newPassword = await resetUserPassword(userId);
          alert(`Contraseña nueva para ${email}:\n\n${newPassword}\n\nPasásela a la persona ahora -- no se va a volver a mostrar.`);
        });
      }}
      className="flex items-center gap-1.5 rounded-lg border border-sand-200 px-2.5 py-1.5 text-xs font-semibold text-navy-800/70 disabled:opacity-50"
    >
      <KeyRound className="h-3.5 w-3.5" /> {isPending ? "Generando..." : "Restablecer contraseña"}
    </button>
  );
}
