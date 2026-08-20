import Link from "next/link";

// Encabezado de sección reutilizable: título + link opcional a la derecha
// ("Ver todos"). Unifica el patrón que se repetía suelto en cada pantalla.
export function SectionHeader({
  title,
  href,
  linkLabel = "Ver todos",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-navy-900">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-semibold text-cr-red-600">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
