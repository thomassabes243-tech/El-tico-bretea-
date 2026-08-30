"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessagesSquare, Wrench, FileText, CircleUserRound } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/comunidad", label: "Comunidad", icon: MessagesSquare },
  // Apunta a /cotizaciones, que redirige según el rol a /servicios/* o
  // /empresa/servicios -- por eso isActive también matchea esos otros
  // prefijos, no solo el literal "/cotizaciones".
  { href: "/cotizaciones", label: "Cotizaciones", icon: Wrench },
  { href: "/cv", label: "CV", icon: FileText },
  { href: "/perfil", label: "Perfil", icon: CircleUserRound },
];

const COTIZACIONES_PREFIXES = ["/cotizaciones", "/servicios", "/empresa/servicios"];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : href === "/cotizaciones"
                ? COTIZACIONES_PREFIXES.some((p) => pathname.startsWith(p))
                : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-transform active:scale-90"
            >
              <span
                className={clsx(
                  "flex h-7 w-11 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-mx-red-600/10"
                )}
              >
                <Icon
                  strokeWidth={isActive ? 2.4 : 2}
                  className={clsx(
                    "h-5.5 w-5.5 transition-colors",
                    isActive ? "text-mx-red-600" : "text-navy-800/50"
                  )}
                />
              </span>
              <span className={clsx(isActive ? "text-navy-900" : "text-navy-800/50")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
