type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/**
 * Marca "El Mexa Chamba": insignia circular con rostro estilizado (sombrero
 * verde, piel tostada, bigote) sobre fondo crema, con un detalle tipo
 * bandera de México (verde/blanco/rojo) como listón inferior.
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
      aria-label="El Mexa Chamba"
    >
      <circle cx="50" cy="48" r="48" fill="#faf3e6" />
      <circle cx="50" cy="48" r="48" fill="url(#logoGradient)" fillOpacity="0.2" />

      {/* Cuello / hombros */}
      <path d="M20 96 Q20 70 34 64 L66 64 Q80 70 80 96 Z" fill="#0b3d2e" />

      {/* Cara */}
      <ellipse cx="50" cy="52" rx="19" ry="20" fill="#c98a53" />

      {/* Bigote */}
      <path
        d="M33 58 Q40 65 50 61 Q60 65 67 58 Q60 60 50 56 Q40 60 33 58 Z"
        fill="#241609"
      />

      {/* Ala del sombrero */}
      <ellipse cx="50" cy="34" rx="34" ry="9" fill="#0b3d2e" />
      {/* Copa del sombrero */}
      <path d="M32 34 Q32 12 50 12 Q68 12 68 34 Z" fill="#0f5c43" />
      <ellipse cx="50" cy="34" rx="18" ry="4.5" fill="#0b3d2e" />

      {/* Listón bandera de México */}
      <clipPath id="flagClip">
        <rect x="14" y="100" width="72" height="10" rx="5" />
      </clipPath>
      <g clipPath="url(#flagClip)">
        <rect x="14" y="100" width="24" height="10" fill="#006341" />
        <rect x="38" y="100" width="24" height="10" fill="#f6f7fb" />
        <rect x="62" y="100" width="24" height="10" fill="#ce1126" />
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
          El Mexa <span className="text-mx-red-600">Chamba</span>
        </span>
      )}
    </div>
  );
}
