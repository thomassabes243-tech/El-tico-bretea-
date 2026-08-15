export function CancunScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cancunSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a63a3" />
          <stop offset="55%" stopColor="#6fb3d9" />
          <stop offset="100%" stopColor="#ffd58a" />
        </linearGradient>
        <linearGradient id="cancunSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a6e8a" />
          <stop offset="100%" stopColor="#0a2647" />
        </linearGradient>
      </defs>

      <rect width="800" height="300" fill="url(#cancunSky)" />
      <circle cx="640" cy="90" r="46" fill="#fff3d6" opacity="0.9" />
      <circle cx="640" cy="90" r="70" fill="#fff3d6" opacity="0.25" />

      {/* mar */}
      <rect y="170" width="800" height="60" fill="url(#cancunSea)" />
      <path d="M0 178 Q40 172 80 178 T160 178 T240 178 T320 178 T400 178 T480 178 T560 178 T640 178 T720 178 T800 178" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      <path d="M0 196 Q40 190 80 196 T160 196 T240 196 T320 196 T400 196 T480 196 T560 196 T640 196 T720 196 T800 196" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" fill="none" />

      {/* arena */}
      <path d="M0 225 Q200 205 400 228 T800 220 L800 300 L0 300 Z" fill="#f3d9a4" />
      <path d="M0 250 Q220 235 420 255 T800 248 L800 300 L0 300 Z" fill="#e8c483" />

      {/* palmera */}
      <g transform="translate(120 300)">
        <path d="M0 0 C-6 -60 -2 -110 6 -150" stroke="#5b3a22" strokeWidth="7" fill="none" strokeLinecap="round" />
        <g fill="#1c6b4a">
          <path d="M6 -150 C-40 -160 -70 -140 -90 -110 C-55 -118 -25 -128 6 -150" />
          <path d="M6 -150 C50 -168 85 -155 105 -125 C68 -125 35 -132 6 -150" />
          <path d="M6 -150 C-20 -185 -18 -215 0 -240 C16 -212 18 -182 6 -150" />
          <path d="M6 -150 C40 -190 70 -195 95 -178 C62 -168 32 -160 6 -150" />
        </g>
      </g>

      <g transform="translate(700 300)" opacity="0.85">
        <path d="M0 0 C-4 -40 -1 -75 4 -100" stroke="#5b3a22" strokeWidth="5" fill="none" strokeLinecap="round" />
        <g fill="#1c6b4a">
          <path d="M4 -100 C-28 -108 -48 -94 -62 -74 C-38 -80 -16 -87 4 -100" />
          <path d="M4 -100 C34 -112 58 -103 72 -83 C46 -84 24 -90 4 -100" />
        </g>
      </g>
    </svg>
  );
}
