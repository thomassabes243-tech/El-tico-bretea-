"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import { LogoMark } from "@/components/brand/Logo";
import { LogOut } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/empresas", label: "Empresas" },
  { href: "/admin/vacantes", label: "Vacantes" },
  { href: "/admin/importar-oferta", label: "Importar oferta" },
  { href: "/admin/moderadores", label: "Moderadores" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/admin/puntos-encuentro", label: "Puntos de encuentro" },
  { href: "/admin/publicidad", label: "Publicidad" },
  { href: "/admin/configuracion", label: "Configuración" },
  { href: "/admin/almacenamiento", label: "Almacenamiento" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-sand-50">
      <header className="border-b border-sand-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <LogoMark size={28} />
            <div>
              <p className="text-sm font-extrabold leading-tight text-navy-900">Méxicosinhambre</p>
              <p className="text-[11px] leading-tight text-navy-800/50">Panel administrador</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-navy-800/70 hover:bg-sand-100"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  isActive ? "bg-navy-900 text-white" : "text-navy-800/60 hover:bg-sand-100"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
