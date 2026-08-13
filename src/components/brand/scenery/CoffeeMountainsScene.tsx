export function CoffeeMountainsScene({ className }: { className?: string }) {
  const rows = [
    { y: 300, h: 130, fill: "#274d2f" },
    { y: 300, h: 105, fill: "#2f5c37" },
    { y: 300, h: 80, fill: "#3a6d40" },
    { y: 300, h: 55, fill: "#487f48" },
  ];

  return (
    <svg
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="coffeeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5324a" />
          <stop offset="45%" stopColor="#e08a52" />
          <stop offset="100%" stopColor="#f4c97a" />
        </linearGradient>
      </defs>

      <rect width="800" height="300" fill="url(#coffeeSky)" />
      <circle cx="150" cy="90" r="42" fill="#fff0d6" opacity="0.85" />

      {/* terrazas de montaña escalonadas */}
      {rows.map((r, i) => (
        <path
          key={i}
          d={`M0 ${r.y - r.h} Q200 ${r.y - r.h - 25} 400 ${r.y - r.h + 10} T800 ${r.y - r.h} L800 300 L0 300 Z`}
          fill={r.fill}
        />
      ))}

      {/* hileras de cafetales (líneas de terraza) */}
      {[195, 215, 235, 255, 275].map((y, i) => (
        <path
          key={y}
          d={`M0 ${y} Q200 ${y - 12} 400 ${y + 6} T800 ${y}`}
          stroke="#1c3a24"
          strokeWidth="2"
          fill="none"
          opacity={0.35 - i * 0.03}
        />
      ))}

      {/* puntos = arbustos de café */}
      {Array.from({ length: 60 }).map((_, i) => {
        const x = (i * 53) % 800;
        const rowIndex = i % 4;
        const y = 200 + rowIndex * 22 + ((i * 17) % 10);
        return <circle key={i} cx={x} cy={y} r="3" fill="#1c3a24" opacity="0.5" />;
      })}
    </svg>
  );
}
