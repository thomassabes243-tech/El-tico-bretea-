"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

export function TopBar() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-sand-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size={32} />
          <span className="font-extrabold tracking-tight text-navy-900">
            México <span className="text-mx-red-600">SinHambre</span>
          </span>
        </Link>

        {status === "authenticated" ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-navy-800/70 hover:bg-sand-100"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        ) : status === "loading" ? (
          <div className="h-9 w-20 animate-pulse rounded-lg bg-sand-100" />
        ) : (
          <div className="flex items-center gap-2">
            <Button href="/iniciar-sesion" variant="ghost" size="sm">
              Entrar
            </Button>
            <Button href="/registro" variant="primary" size="sm">
              Crear cuenta
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
