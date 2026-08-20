import type { ReactNode } from "react";
import { BackButton } from "@/components/nav/BackButton";

// Header "task-focused" para pantallas de detalle (una vacante, una
// aplicación, etc.): volver + título centrado + acción opcional a la
// derecha, en vez de la barra global con logo/avatar. Sin bottom nav
// debajo -- estas pantallas tienen su propia acción principal fija abajo.
export function DetailHeader({
  title,
  fallbackHref,
  action,
}: {
  title: string;
  fallbackHref: string;
  action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sand-200 bg-white/90 px-2 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <BackButton fallbackHref={fallbackHref} />
      <h1 className="flex-1 truncate px-2 text-center font-heading text-sm font-bold text-navy-900">
        {title}
      </h1>
      <div className="flex h-10 w-10 items-center justify-center">{action}</div>
    </header>
  );
}
