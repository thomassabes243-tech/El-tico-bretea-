export function PoasScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="poasForest" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2b6b4a" />
          <stop offset="100%" stopColor="#173f2c" />
        </linearGradient>
        <radialGradient id="poasLake" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#7fe0d6" />
          <stop offset="60%" stopColor="#2fa9a0" />
          <stop offset="100%" stopColor="#1c7a75" />
        </radialGradient>
        <radialGradient id="poasLagoon" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#5fb8e8" />
          <stop offset="100%" stopColor="#1f6fa8" />
        </radialGradient>
        <radialGradient id="poasCrater" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#8a6a4e" />
          <stop offset="100%" stopColor="#4a3626" />
        </radialGradient>
      </defs>

      {/* bosque de fondo, vista aérea */}
      <rect width="800" height="300" fill="url(#poasForest)" />
      <path d="M0 0 L120 40 L40 120 L0 90 Z" fill="#215a3c" opacity="0.6" />
      <path d="M760 0 L800 0 L800 60 L700 90 Z" fill="#215a3c" opacity="0.6" />
      <path d="M0 260 L90 220 L180 280 L60 300 L0 300 Z" fill="#12351f" opacity="0.55" />
      <path d="M620 260 L720 230 L800 270 L800 300 L650 300 Z" fill="#12351f" opacity="0.5" />

      {/* laguna Botos, arriba a la izquierda */}
      <g transform="translate(150 75)">
        <ellipse rx="72" ry="50" fill="#1d4f34" opacity="0.7" />
        <ellipse rx="46" ry="30" fill="url(#poasLagoon)" />
        <ellipse cx="-10" cy="-8" rx="16" ry="9" fill="#ffffff" opacity="0.25" />
      </g>

      {/* cráter principal */}
      <g transform="translate(470 175)">
        <ellipse rx="220" ry="118" fill="url(#poasCrater)" />
        <ellipse rx="220" ry="118" fill="none" stroke="#2f2013" strokeWidth="3" opacity="0.4" />
        {/* paredes del cráter con textura */}
        <path d="M-190 -40 Q-120 -95 -20 -100 Q90 -105 170 -50 Q140 10 60 30 Q-60 55 -160 10 Z" fill="#a9855f" opacity="0.55" />
        <path d="M-150 50 Q-40 90 90 70 Q160 55 180 10 Q120 70 20 85 Q-90 100 -150 50 Z" fill="#5c3f28" opacity="0.5" />

        {/* laguna turquesa del cráter */}
        <ellipse cx="-30" cy="10" rx="95" ry="55" fill="url(#poasLake)" />
        <ellipse cx="-55" cy="-8" rx="30" ry="14" fill="#ffffff" opacity="0.3" />

        {/* fumarola */}
        <g opacity="0.92">
          <ellipse cx="60" cy="-10" rx="24" ry="16" fill="#f3f4f6" opacity="0.85" />
          <ellipse cx="100" cy="-45" rx="34" ry="20" fill="#eef0f3" opacity="0.75" />
          <ellipse cx="150" cy="-85" rx="46" ry="26" fill="#e9ebef" opacity="0.65" />
          <ellipse cx="215" cy="-118" rx="58" ry="30" fill="#e5e8ec" opacity="0.5" />
          <ellipse cx="290" cy="-140" rx="65" ry="30" fill="#e5e8ec" opacity="0.35" />
        </g>
      </g>

      {/* borde selvático delantero */}
      <path d="M0 300 Q200 265 400 288 T800 275 L800 300 Z" fill="#123a27" opacity="0.7" />
    </svg>
  );
}
