export function ArenalScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="arenalSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2647" />
          <stop offset="55%" stopColor="#123a63" />
          <stop offset="100%" stopColor="#a5324a" />
        </linearGradient>
        <radialGradient id="arenalGlow" cx="50%" cy="100%" r="70%">
          <stop offset="0%" stopColor="#ff8a5b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff8a5b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="300" fill="url(#arenalSky)" />
      <rect width="800" height="300" fill="url(#arenalGlow)" />

      {/* estrellas */}
      {[
        [60, 40], [140, 70], [220, 30], [340, 55], [420, 25], [520, 60], [610, 35], [700, 50], [760, 20],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#ffffff" opacity="0.6" />
      ))}

      {/* cordillera lejana */}
      <path d="M0 210 L90 175 L180 205 L260 170 L340 200 L430 165 L520 200 L610 178 L700 205 L800 185 L800 300 L0 300 Z" fill="#0d3255" opacity="0.7" />

      {/* volcán Arenal */}
      <path d="M300 220 L400 60 L500 220 Z" fill="#061b33" />
      <path d="M370 100 L400 60 L430 100 Z" fill="#ff8a5b" opacity="0.85" />
      <circle cx="400" cy="66" r="7" fill="#ffb185" opacity="0.9" />

      {/* colinas frente */}
      <path d="M0 250 Q150 210 300 245 T600 240 T800 250 L800 300 L0 300 Z" fill="#061b33" />

      {/* aves */}
      <path d="M560 90 q8 -10 16 0 q8 -10 16 0" stroke="#f6f7fb" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M610 115 q7 -9 14 0 q7 -9 14 0" stroke="#f6f7fb" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}
