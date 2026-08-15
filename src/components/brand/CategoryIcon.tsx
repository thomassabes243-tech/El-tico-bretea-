import {
  HardHat,
  Palmtree,
  UtensilsCrossed,
  SprayCan,
  Truck,
  ShieldCheck,
  Building2,
  ShoppingBag,
  Laptop,
  Briefcase,
  Search,
  FileText,
  Users,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  CONSTRUCCION: HardHat,
  HOTELES_TURISMO: Palmtree,
  RESTAURANTES: UtensilsCrossed,
  LIMPIEZA: SprayCan,
  TRANSPORTE: Truck,
  SEGURIDAD: ShieldCheck,
  OFICINAS_ADMINISTRACION: Building2,
  VENTAS_COMERCIO: ShoppingBag,
  TECNOLOGIA: Laptop,
  PROFESIONALES: Briefcase,
  BUSCAR_TRABAJO: Search,
  CREAR_CV: FileText,
  BUSCAR_PERSONAL: Users,
};

type CategoryIconProps = {
  category: keyof typeof CATEGORY_ICON_MAP | string;
  size?: "sm" | "md" | "lg";
  tone?: "navy" | "red";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-12 w-12 [&_svg]:h-5.5 [&_svg]:w-5.5",
  lg: "h-16 w-16 [&_svg]:h-7 [&_svg]:w-7",
};

const toneClasses = {
  navy: "bg-navy-900/[0.07] text-navy-800",
  red: "bg-mx-red-600/[0.09] text-mx-red-600",
};

export function CategoryIcon({ category, size = "md", tone = "navy", className }: CategoryIconProps) {
  const Icon = CATEGORY_ICON_MAP[category] ?? Briefcase;
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-2xl",
        sizeClasses[size],
        toneClasses[tone],
        className
      )}
    >
      <Icon strokeWidth={2.1} />
    </div>
  );
}
