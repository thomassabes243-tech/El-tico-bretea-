"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <LogoMark size={44} />
      <Card className="mt-6 flex max-w-sm flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mx-red-600/[0.09] text-mx-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-extrabold text-navy-900">Algo salió mal</h1>
        <p className="text-sm text-navy-800/60">
          Tuvimos un problema inesperado. Podés intentar de nuevo.
        </p>
        <Button onClick={reset} size="sm">Intentar de nuevo</Button>
        <Link href="/" className="text-xs font-semibold text-mx-red-600">
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}
