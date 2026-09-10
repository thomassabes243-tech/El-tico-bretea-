"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

export function TopBar() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 shadow-[0_4px_20px_rgba(10,38,71,0.05)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/78">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size={38} />
          <span className="leading-tight">
            <span className="block text-[17px] font-extrabold tracking-[-0.025em] text-navy-900">
              El Mexa <span className="text-mx-red-600">Chamba</span>
            </span>
            <span className="block text-[11px] font-medium text-navy-800/50">Aquí sí hay chamba</span>
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
