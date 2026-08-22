import Image from "next/image";

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

// Proporción real del arte de la marca (public/brand/logo-mark.png).
const MARK_RATIO = 371 / 360;

/**
 * Marca "El Tico Bretea": ilustración real del logo (trabajador con
 * gorra, barba, café y hoja, sobre silueta de Costa Rica).
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt="El Tico Bretea"
      width={size}
      height={Math.round(size * MARK_RATIO)}
      className={className}
      priority
    />
  );
}

export function Logo({ size = 40, showWordmark = true, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="font-extrabold leading-tight tracking-tight text-navy-900" style={{ fontSize: size * 0.42 }}>
          El Tico<br className="hidden" />
          <span className="text-cr-red-600"> Bretea</span>
        </span>
      )}
    </div>
  );
}
