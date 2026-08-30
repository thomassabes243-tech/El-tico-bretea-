// Ícono compuesto propio para la función de seguridad/GPS del Home: escudo
// (protección) + pin de ubicación (GPS) + arcos de señal -- no es un ícono
// suelto de una librería, es la combinación puntual que pide el rediseño
// para que esta tarjeta se sienta como una función premium propia de la
// app, no un ícono genérico de alerta.
export function SafetyBadgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 4.5 8 8.5v8.6c0 8.1 5.1 14.9 12 16.9 6.9-2 12-8.8 12-16.9V8.5L20 4.5Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path
        d="M20 4.5 8 8.5v8.6c0 8.1 5.1 14.9 12 16.9 6.9-2 12-8.8 12-16.9V8.5L20 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 12.8c-2.3 0-4.1 1.8-4.1 4 0 3 4.1 7.4 4.1 7.4s4.1-4.4 4.1-7.4c0-2.2-1.8-4-4.1-4Z"
        fill="currentColor"
      />
      <circle cx="20" cy="16.7" r="1.4" fill="white" />
      <path
        d="M28.5 12c1.6 1.1 2.6 2.9 2.6 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M30.7 9.8c2.3 1.6 3.7 4.2 3.7 7.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
