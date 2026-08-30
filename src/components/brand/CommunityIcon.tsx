// Ícono propio para "Comunidad Mexa": tres personas conectadas por líneas de
// conversación, en vez del típico globo de chat suelto -- transmite apoyo
// entre pares, no solo "hay un chat acá".
export function CommunityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="currentColor" fillOpacity="0.12" />
      <circle cx="14.5" cy="16.5" r="3.1" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="25.5" cy="16.5" r="3.1" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="20" cy="24.2" r="3.4" fill="currentColor" />
      <path
        d="M17 18.6c-1.9.8-3.2 2.6-3.4 4.7M23 18.6c1.9.8 3.2 2.6 3.4 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
