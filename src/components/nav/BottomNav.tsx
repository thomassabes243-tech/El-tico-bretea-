"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessagesSquare, FileText, CircleUserRound } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/comunidad", label: "Comunidad", icon: MessagesSquare },
  { href: "/cv", label: "CV", icon: FileText },
  { href: "/perfil", label: "Perfil", icon: CircleUserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium"
            >
              <Icon
                strokeWidth={isActive ? 2.4 : 2}
                className={clsx(
                  "h-5.5 w-5.5 transition-colors",
                  isActive ? "text-mx-red-600" : "text-navy-800/50"
                )}
              />
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
