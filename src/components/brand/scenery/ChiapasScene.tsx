export function ChiapasScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="chiapasSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123a63" />
          <stop offset="100%" stopColor="#bcd6cf" />
        </linearGradient>
      </defs>

      <rect width="800" height="300" fill="url(#chiapasSky)" />

      {/* niebla capas de montañas, de atrás hacia adelante */}
      <path d="M0 150 L100 100 L220 145 L330 90 L430 140 L560 95 L660 150 L800 110 L800 300 L0 300 Z" fill="#5c8778" opacity="0.55" />
      <path d="M0 190 L120 150 L240 185 L360 135 L480 185 L600 150 L720 190 L800 165 L800 300 L0 300 Z" fill="#3f6a58" opacity="0.75" />
      <path d="M0 230 L140 195 L260 225 L400 185 L520 225 L660 195 L800 225 L800 300 L0 300 Z" fill="#28503f" />

      {/* niebla horizontal */}
      <rect x="0" y="160" width="800" height="22" fill="#f6f7fb" opacity="0.22" />
      <rect x="0" y="205" width="800" height="16" fill="#f6f7fb" opacity="0.18" />

      {/* silueta de ave (tucán simplificado) */}
      <g transform="translate(560 205)" fill="#0d2a1e">
        <ellipse cx="0" cy="0" rx="12" ry="9" />
        <circle cx="-11" cy="-6" r="6" />
        <path d="M-21 -6 L-38 -3 L-21 1 Z" fill="#ce8a2e" />
      </g>
    </svg>
  );
}
