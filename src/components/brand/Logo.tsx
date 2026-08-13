type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/**
 * Marca "El Tico Bretea": insignia circular con silueta de trabajador
 * (gorra + hombros) en azul marino/rojo, con un detalle tipo bandera
 * de Costa Rica como listón inferior.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.14}
      viewBox="0 0 100 114"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="El Tico Bretea"
    >
      <circle cx="50" cy="48" r="48" fill="#0a2647" />
      <circle cx="50" cy="48" r="48" fill="url(#logoGradient)" fillOpacity="0.25" />

      {/* Hombros / torso */}
      <path d="M18 94 Q18 66 32 60 L68 60 Q82 66 82 94 Z" fill="#f6f7fb" />

      {/* Cabeza */}
      <circle cx="50" cy="43" r="15" fill="#f6f7fb" />

      {/* Gorra */}
      <path d="M32 35 Q32 17 50 17 Q68 17 68 35 Z" fill="#ce1126" />
      <ellipse cx="50" cy="35" rx="19" ry="5.5" fill="#a50e1f" />

      {/* Llave inglesa */}
      <g transform="translate(60 66) rotate(35)">
        <rect x="-4" y="-16" width="8" height="30" rx="3" fill="#f6f7fb" />
        <circle cx="0" cy="-16" r="8" fill="none" stroke="#f6f7fb" strokeWidth="4.5" />
        <circle cx="0" cy="16" r="6" fill="none" stroke="#f6f7fb" strokeWidth="4" />
      </g>

      {/* Listón bandera de Costa Rica */}
      <clipPath id="flagClip">
        <rect x="14" y="100" width="72" height="10" rx="5" />
      </clipPath>
      <g clipPath="url(#flagClip)">
        <rect x="14" y="100" width="72" height="2" fill="#1c4d80" />
        <rect x="14" y="102" width="72" height="2" fill="#f6f7fb" />
        <rect x="14" y="104" width="72" height="2" fill="#ce1126" />
        <rect x="14" y="106" width="72" height="2" fill="#f6f7fb" />
        <rect x="14" y="108" width="72" height="2" fill="#1c4d80" />
      </g>

      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="114" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
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
